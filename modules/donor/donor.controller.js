const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;

const DonorModel = require("./donor.model");
const { TextUtils, ERR, DataUtils } = require("../../utils");

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
  constructor() {}

  async checkBloodVerification(donorID, blood_group) {
    // let blood_info = splitBloodInfo(blood_group);
    let donor = await DonorModel.findById(donorID);
    return donor.blood_info.is_verified ? true : false;
  }

  addTeam({ donor_id, teams }) {
    return DonorModel.findByIdAndUpdate(donor_id, { $addToSet: { teams } }, { new: true });
  }

  save(payload) {
    if (payload.id) return this.update(payload.id, payload);
    else return this.add(payload);
  }

  async searchDonorId(userId) {
    let donor = await DonorModel.find({
      user_id: userId
    });
    return donor;
  }
  // async removeDonorWithConsent(donor, event) {
  //     let r = await ConsentModel.findOneAndDelete({
  //         donor: ObjectId(donor),
  //         event: ObjectId(event)
  //     });
  //     console.log(r);
  //     await DonorModel.findByIdAndDelete(donor);
  // }

  async update(id, payload) {
    if (await this.checkBloodVerification(id)) {
      delete payload.blood_group;
    }

    payload.blood_group = payload.blood_group ? payload.blood_group : null;
    if (!payload.blood_info) {
      if (typeof payload.blood_group == "string") {
        let blood_info = splitBloodInfo(payload.blood_group);
        delete payload.blood_group;
        payload.blood_info = blood_info;
      } else if (!payload.blood_group) {
        delete payload.blood_group;
      } else {
        payload.blood_info = payload.blood_group;
        delete payload.blood_group;
      }
    }

    return DonorModel.findOneAndUpdate({ _id: id }, { $set: payload }, { new: true });
  }

  async listByEvent({ start = 0, limit = 1, search = null, eventId, isComplete = false }) {
    let query = {};
    if (search) {
      const $regex = new RegExp(TextUtils.escapeRegex(search), "gi");
      query = {
        $or: [
          {
            "donor.name": { $regex }
          },
          {
            "blood_info.bag_number": { $regex }
          }
        ]
      };
    }

    let matchedData = await ConsentModel.aggregate([
      {
        $match: {
          event: ObjectId(eventId),
          is_completed: isComplete
        }
      },
      {
        $lookup: {
          from: "donors",
          localField: "donor",
          foreignField: "_id",
          as: "donor"
        }
      },
      {
        $unwind: {
          path: "$donor",
          preserveNullAndEmptyArrays: true
        }
      },
      { $match: query },
      {
        $addFields: {
          revisedBloodBag: "$blood_info.bag_number"
        }
      },
      // {
      //   $pr
      // },
      {
        $facet: {
          data: [
            {
              $sort: {
                created_at: -1
              }
            },
            {
              $skip: parseInt(start)
            },
            {
              $limit: parseInt(limit)
            }
          ],
          total: [
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
    ]);

    let data = [],
      total = 0;
    if (matchedData[0].data.length > 0) {
      data = matchedData[0].data;
      total = matchedData[0].total[0].count;
      for (let d in data) {
        if (data[d].blood_info)
          if (data[d].blood_info.bag_number) {
            let bloodBag = data[d].blood_info.bag_number.replace(/\D/g, "");
            data[d].revisedBloodBag = bloodBag;
          }
      }
    }
    return {
      data,
      total,
      limit,
      start,
      page: Math.round(start / total) + 1
    };
  }

  async removeDonation(donorId, donationId) {
    let donor = await DonorModel.findById(donorId);
    let donations = donor.donations.filter(d => d.donation_id != donationId);
    let latest = _.maxBy(donations, o => o.date);
    donor.set({
      last_donated_date: latest.date,
      donations
    });
    await donor.save();
    return donations;
  }

  async addDonation(donorId, donation) {
    donation.donation_id = mongoose.Types.ObjectId();
    if (!donation.date) {
      donation.date = new Date();
    } else {
      donation.date = new Date(donation.date);
    }
    if (moment().diff(moment(donation.date), "days") < 0) throw ERR.DATE_FUTURE;

    let donor = await DonorModel.findById(donorId);
    let donations = donor.donations.concat(donation);
    let latest = _.maxBy(donations, o => o.date);
    donor.set({
      last_donated_date: latest.date,
      donations
    });
    await donor.save();

    return donations;
  }

  async get(donorId) {
    return DonorModel.findById(donorId);
  }

  getByPhone(phone) {
    return DonorModel.findOne({ phone: phone });
  }

  getByName(name) {
    return DonorModel.findOne({ name: name });
  }

  remove(donorId) {
    return new Promise((resolve, reject) => {
      DonorModel.remove({
        _id: donorId
      })
        .then(d => resolve(d))
        .catch(e => reject(e));
    });
  }

  list({ limit, start, group, phone, name }) {
    let page = parseInt(start) / parseInt(limit) + 1;
    let query = {};
    if (group)
      query = {
        blood_group: group
      };
    else if (phone) {
      const regex = new RegExp(TextUtils.escapeRegex(phone), "gi");
      query = {
        phone: {
          $regex: regex
        }
      };
    } else if (name) {
      const regex = new RegExp(TextUtils.escapeRegex(name), "gi");
      query = {
        name: {
          $regex: regex
        }
      };
    }

    return new Promise((resolve, reject) => {
      DonorModel.aggregate([
        {
          $facet: {
            data: [
              {
                $project: {
                  name: 1,
                  phone: 1,
                  email: 1,
                  age: 1,
                  gender: 1,
                  dob: 1,
                  blood_group: 1,
                  last_donated_date: 1,
                  geo_location: 1,
                  updated_at: 1,
                  created_at: 1,
                  donations_total: {
                    $size: "$donations"
                  }
                }
              },
              {
                $match: query
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

  removeTeam({ team_id, donor_id }) {
    let payload = { teams: team_id };
    return DonorModel.findByIdAndUpdate(donor_id, { $pull: payload }, { new: true, password: 0 });
  }

  async listTeamDonors({ id, limit, start, name, group }) {
    let regex;
    if (name === null) {
      regex = "";
    } else {
      regex = new RegExp(TextUtils.escapeRegex(name), "gi");
    }
    let matchfield = {};
    if (group) {
      matchfield = { blood_group: group };
    }
    let teamId = ObjectId(id);
    return DataUtils.paging({
      limit,
      start,
      sort: { created_at: -1 },
      model: DonorModel,
      query: [
        {
          $match: { teams: teamId }
        },
        {
          $match: {
            name: { $regex: regex }
          }
        },
        { $match: {} },
        {
          $project: {
            name: 1,
            phone: 1,
            email: 1,
            blood_info: 1,
            blood_group: {
              $concat: ["$blood_info.group", "$blood_info.rh_factor"]
            },
            created_at: 1,
            updated_at: 1
          }
        },
        {
          $match: matchfield
        }
      ]
    });
  }
}

module.exports = new Donors();
