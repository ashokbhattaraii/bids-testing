const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;

const RequestModel = require("./request.model");
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

class Request {
  constructor() {}

  save(payload) {
    let requestModel = RequestModel(payload);
    return requestModel.save();
  }

  async update(id, payload, type) {
    let result;
    if (type == "set")
      result = await RequestModel.findOneAndUpdate({ _id: id }, { $set: payload }, { new: true });
    if (type == "push")
      result = await RequestModel.findOneAndUpdate({ _id: id }, { $push: payload }, { new: true });
    if (type == "addToSet")
      result = await RequestModel.findOneAndUpdate(
        { _id: id },
        { $addToSet: payload },
        { new: true }
      );
    if (type == "pull")
      result = await RequestModel.findOneAndUpdate({ _id: id }, { $pull: payload }, { new: true });

    return result;
  }

  remove(requestId) {
    return RequestModel.findByIdAndDelete(requestId);
  }

  async get(requestId) {
    return RequestModel.findById(requestId).populate("donors");
  }

  getByName(name) {
    return RequestModel.findOne({ name: name });
  }

  list({ limit, start, group, requester_phone, requester_name, address }) {
    let page = parseInt(start) / parseInt(limit) + 1;
    let query = {};
    if (group)
      query = {
        group: group
      };
    else if (requester_phone) {
      const regex = new RegExp(TextUtils.escapeRegex(requester_phone), "gi");
      query = {
        requester_phone: {
          $regex: regex
        }
      };
    } else if (requester_name) {
      const regex = new RegExp(TextUtils.escapeRegex(requester_name), "gi");
      query = {
        requester_name: {
          $regex: regex
        }
      };
    } else if (address) {
      const regex = new RegExp(TextUtils.escapeRegex(address), "gi");
      query = {
        address: {
          $regex: regex
        }
      };
    }

    return new Promise((resolve, reject) => {
      RequestModel.aggregate([
        {
          $facet: {
            data: [
              {
                $project: {
                  name: 1,
                  requester_phone: 1,
                  requester_name: 1,
                  patient_name: 1,
                  hospital: 1,
                  rh_factor: 1,
                  blood_group: 1,
                  donors: 1,
                  address: 1,
                  createdAt: 1,
                  group: { $concat: ["$blood_group", "$rh_factor"] },
                  donors_total: {
                    $size: "$donors"
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
}

module.exports = new Request();
