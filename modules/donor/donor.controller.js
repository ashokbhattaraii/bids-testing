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
const donor_ratingModel = require("./donor_rating.model");

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

  async getDonorRating(id) {
    let donorId = ObjectId(id);
    return donor_ratingModel.find({ donorId: `${donorId}` });
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

  async getDonorsList( limit, start, group, name, address,phone,gender) {
    let donorData = await donation.getDonorsList( limit, start, group, name, address,phone,gender );
    return this.getAverageRating(donorData);    
  }

  async getAverageRating(donorData){
    let total_rating = 0;
    if(donorData){
      for(let i=0;i<donorData.data.length;i++){
        let data = await DonorRatingModel.find({donorId:donorData.data[i]._id})
        if(data.length>0) {
          data.map(val=>{
            total_rating+=val.rating
          })
          donorData.data[i].donorRating = total_rating/(data.length);
        }   
      }
      return donorData;
    }

  }

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
        status:payload.status,
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

  editUnverifiedStatus(payload, id) {
    return UnverifeidDonorModel.findByIdAndUpdate(
      id,
      { $set: { is_verified: payload.is_verified } },
      { upsert: true, new: true }
    );
  }

  async updateUnverifiedDonor(id, payload) {
    return UnverifeidDonorModel.findOneAndUpdate({ _id: id }, { $set: payload }, { new: true });
  }

  getUnverifiedDonor(donorId) {
    return UnverifeidDonorModel.findById(donorId);
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

  async excelToJSON(filePath) {
    var result = await excelToJson({
      sourceFile: filePath,
      header: {
        rows: 1
      },
      columnToKey: {
        A: "event_id",
        B: "event_name",
        C: "name",
        D: "age",
        E: "blood_group",
        F: "phone",
        G: "last_donated_date",
        H: "entry_date",
        I: "email",
        J: "address"
      }
    });
   
    const data = result.Sheet1 ? result.Sheet1 : result["Sheet 1"];
    const doc = await this.extractEachFile(data);
    fs.unlinkSync(filePath);
    return doc;
  }

  async extractEachFile(data) {
   
    let count = 0;
    const obj = {
      success: true,
      message: "File uploaded successfully."
    };
    
    for (let i=1;i<=data.length;i++) {
      data[i].gender = data[i].age.split('/')[1].toUpperCase();
      const doc = await this.saveUnverified(data[i]);
      if (doc) {
        count = count + 1;
      }
    }
    obj.uploadedDocs = count;
    return obj;
  }

  async saveRating(payload) {
    return await DonorRatingModel.create(payload);
  }
}

module.exports = new Donors();
