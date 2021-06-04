const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const excelToJson = require("convert-excel-to-json");
const fs = require("fs");

const DonorService = require("./service");
const DonorModel = require("./donor.model");
const UnverifeidDonorModel = require("./unverifiedDonor.model");
const DonorRatingModel = require("./donor_rating.model");
const { TextUtils, ERR, DataUtils } = require("../../utils");
const donation = require("../../donation");

const splitBloodInfo = blood_info => {
  let rh_factor = blood_info.match(/\+|-/);
  rh_factor = rh_factor[0].toString();
  let group = blood_info.replace(/\+|-/, "");
  return (blood_info = {
    group: group,
    rh_factor: rh_factor
  });
};

class Donors {
  constructor(options) {
    this.options = options;
  }

  async getDonorHistory(id) {
    let donorId = ObjectId(id);
    return DonorModel.find({ donor_id: `${donorId}` });
  }

  getByPhone(phone) {
    return DonorService.getByPhone({ phone: phone });
  }

  list({ limit, start, group, phone, name, address }) {
    return DonorService.list({ limit, start, group, phone, name, address });
  }

  async getDonorsList(limit, start, group, name, address, phone, gender) {
    let donorData = await donation.getDonorsList(limit, start, group, name, address, phone, gender);
    return this.getAverageRating(donorData);
  }

  //donor rating model functions start

  async getDonorRating(id) {
    let donorId = ObjectId(id);
    return DonorRatingModel.find({ donorId: `${donorId}` });
  }

  async getAverageRating(donorData) {
    let total_rating = 0;
    if (donorData) {
      for (let i = 0; i < donorData.data.length; i++) {
        let data = await DonorRatingModel.find({ donorId: donorData.data[i]._id })
        if (data.length > 0) {
          data.map(val => {
            total_rating += val.rating
          })
          donorData.data[i].donorRating = total_rating / (data.length);
        }
      }
      return donorData;
    }

  }

  async saveRating(payload) {
    return await DonorRatingModel.create(payload);
  }

  //donor rating model functions end

  listDonorHistory(limit, start, id) {
    return DonorService.donorHistoryList(limit, start, id);
  }

  dispatch(group, address, name, donorids, limit, start) {
    return DonorService.findEligibleDonors(group, address, name, donorids, limit, start);
  }

  save(id, payload) {
    return DonorModel.findOneAndUpdate(
      { donor_id: ObjectId(id) },
      {
        source: payload.source,
        status: payload.status,
        status_note: payload.status_note,
      },
      { upsert: true, new: true }
    );
  }

  unverifiedList({ limit, start, group, phone, name, address, source, page, gender }) {

    if (!page) {
      page = parseInt(start) / parseInt(limit) + 1;
    } else {
      start = (page - 1) * limit;
    }
    let query = { group, phone, name, address, gender, source };
    const condition = {};
    const queryKeys = Object.keys(query);
    if (queryKeys && queryKeys.length) {
      queryKeys.forEach(field => {
        if (query[field] && query[field].length) {
          if (field === "group") {
            condition[`blood_group`] = query[field];
          } else if (field === "name") {
            condition[`${field}`] = {
              $regex: new RegExp("^" + query[field], "i")
            };
          } else if (field === "source") {
            condition["source.name"] = {
              $regex: new RegExp(TextUtils.escapeRegex(source), "gi")
            };
          } else {
            condition[`${field}`] = {
              $regex: new RegExp(query[field], "i")
            };
          }
        }
      });
    }
    return new Promise((resolve, reject) => {
      UnverifeidDonorModel.aggregate([
        {
          $facet: {
            data: [
              {
                $project: {
                  name: 1,
                  phone: 1,
                  gender: 1,
                  dob: 1,
                  address: 1,
                  blood_group: 1,
                  is_verified: 1,
                  agree_to_donate: 1,
                  updated_at: 1,
                  created_at: 1,
                  "source.name": 1
                }
              },
              {
                $match: condition
              },
              {
                $sort: {
                  name: 1
                }
              },
              {
                $skip: start
              },
              {
                $limit: limit
              }
            ],
            summary: [
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1
                  }
                }
              }
            ]
          }
        }
      ])
        .then(d => {
          if (d[0].summary.length > 0)
            resolve({
              total: d[0].summary[0].count,
              limit,
              start,
              page,
              data: d[0].data
            });
          else
            resolve({
              total: 0,
              limit,
              start,
              page,
              data: []
            });
        })
        .catch(e => reject(e));
    });
  }

  saveUnverified(payload) {
    if (payload.id) return this.updateUnverifiedDonor(payload.id, payload);
    else return UnverifeidDonorModel.create(payload);
  }

  async saveUnverifiedBulk(payload) {
    payload = this.fixUnverifiedEmptyValues(payload);

    let doc = await this.getUnverifiedDonorByPhone(payload.phone);
    if (payload.phone) {
      if (doc && doc.phone === payload.phone) {
        doc = doc.toJSON();
        const entries = Object.keys(doc);
        const replacer = Object.keys(payload);
        const updates = {};
        // constructing dynamic query
        for (const d in replacer) {
          const found = entries.find(element => element === replacer[d]);
          updates[found] = payload[found];
        }
        return await UnverifeidDonorModel.updateOne(
          {
            phone: payload.phone
          },
          {
            $set: updates
          }
        );
      }
    }

    if (doc.length <= 0) {
      return await UnverifeidDonorModel.create(payload);
    }
  }

  fixEmptyValues(d) {
    d.name = d.name ? d.name : "";

    if (d.gender) {
      if (d.gender === "MALE" || d.gender === "Male" || d.gender === "male") return d.gender = 'M'
      else if (d.gender === "FEMALE" || d.gender === "Female" || d.gender === "female") return d.gender = 'F'
      return d.gender = d.gender.charAt(0).toUpperCase()
    }
    else {
      d.gender = "O"
    }

    d.blood_group = d.blood_group ? d.blood_group.toUpperCase() : "";
    d.phone = d.phone ? d.phone : "9876543210";
    d.last_contacted_date = d.last_contacted_date ? d.last_contacted_date : "";
    d.remarks = d.remarks ? d.remarks : "";
    d.rating = d.rate ? d.rate : null;
    d.email = d.email ? d.email : "";
    d.address = d.address ? d.address : "";
    d.team = d.team ? d.team : "";
    return d;
  }

  fixUnverifiedEmptyValues(d) {
    d.name = d.name ? d.name : "";
    d.gender = d.gender ? d.gender.charAt(0).toUpperCase() : "O"
    d.blood_group = d.blood_group ? d.blood_group.toUpperCase() : "";
    d.phone = d.phone ? d.phone : "9876543210";
    d.address = d.address ? d.address : "";
    d.team = d.team ? d.team : "";
    return d;
  }

  async editUnverifiedStatus(payload) {
    let donorData = await donation.verifySingleDonor(payload);
    return donorData;
  }

  async updateUnverifiedDonor(id, payload) {
    return UnverifeidDonorModel.findOneAndUpdate({ _id: id }, { $set: payload }, { new: true });
  }

  getUnverifiedDonor(donorId) {
    return UnverifeidDonorModel.findById(donorId);
  }

  getUnverifiedDonorByPhone(phone) {
    return UnverifeidDonorModel.find({ phone: phone });
  }

  removeUnverifiedDonor(donorId) {
    return new Promise((resolve, reject) => {
      UnverifeidDonorModel.remove({
        _id: donorId
      })
        .then(d => resolve(d))
        .catch(e => reject(e));
    });
  }

  async getReports(date, endDate) {
    if (date || endDate) {
      return await UnverifeidDonorModel.find({
        $and: [
          {
            is_verified: true
          },
          {
            updated_at: {
              $gte: date,
              $lte: new Date()
            }
          }
        ]
      }).sort({ name: "asc" });
    } else {
      return await UnverifeidDonorModel.find({
        is_verified: true
      }).sort({ name: "asc" });
    }
  }

  async excelToJSONUnverified(filePath) {
    var result = await excelToJson({
      sourceFile: filePath,
      header: {
        rows: 1
      },
      columnToKey: {
        A: "name",
        B: "phone",
        C: "address",
        D: "blood_group",
        E: "gender",
        F: "team"
      }
    });

    const data = result.Sheet1 ? result.Sheet1 : result["Unverified donor list"];
    const doc = await this.extractEachFile(data);
    console.log(doc, "*******************************");
    // let file = fs.createWriteStream('array.txt');
    // file.on('error', function (err) { /* error handling */ });
    // rejected_unverified_donors.forEach(value => file.write(`${value}\r\n`));
    // file.end();
    // fs.unlink(filePath, err => {
    //   if (err) {
    //     console.log(err);
    //   }
    // });
    // return doc;
  }

  async excelToJSONVerified(filePath) {
    var result = await excelToJson({
      sourceFile: filePath,
      header: {
        rows: 1
      },
      columnToKey: {
        A: "name",
        B: "address",
        C: "phone",
        D: "blood_group",
        E: "gender",
        F: "rate",
        G: "remarks",
        H: "last_contacted_date",
        I: "team"
      }
    });

    const data = result.Sheet1 ? result.Sheet1 : (result["Verified donor"]);
    fs.unlink(filePath, err => {
      if (err) {
        console.log(err);
      }
    });
    const doc = await this.uploadVerifiedDocs(data);
    return doc;

  }

  async uploadVerifiedDocs(payload) {
    let count = 0;
    let donorRatingData;

    const obj = {
      success: true,
      message: "File uploaded successfully."
    };

    let donorData = []

    for (let i = 1; i <= payload.length; i++) {
      payload[i] = this.fixEmptyValues(payload[i]);
      try {
        payload[i].phone = payload[i].phone.toString();

        let mData = await donation.verifySingleDonor(payload[i]);

        if (mData) {
          let ratingPayload = {};
          ratingPayload.donorId = mData._id;
          ratingPayload.rating = payload[i].rating;
          ratingPayload.last_request_date = payload[i].last_contacted_date;
          ratingPayload.remarks = payload[i].remarks;

          donorRatingData = this.saveRating(ratingPayload);
          count = count + 1;
        }
        donorData.push(mData)
      }
      catch (e) {
        console.log(e.response.data)
      }
      finally {
        i = i + 1 - 1
      }
      // return
    }
    obj.uploadedDocs = count;
    obj.donorData = donorData;
    obj.donorRating = donorRatingData;
    return obj;

  }

  async extractEachFile(data) {
    let count = 0;
    let rejected_unverified_donors = [];
    const obj = {
      success: true,
      message: "File uploaded successfully."
    };

    for (let i = 1; i <= data.length; i++) {
      try {
        const doc = await this.saveUnverifiedBulk(data[i]);
        if (doc) {
          count = count + 1;
        }
      }
      catch (e) {
        if (data[i].phone) rejected_unverified_donors.push(data[i].phone);
        console.log(rejected_unverified_donors)
      }
      finally {
        i = i + 1 - 1
      }
    }
    obj.uploadedDocs = count;
    obj.rejected_donors = rejected_unverified_donors
    return obj;
  }

}

module.exports = new Donors();
