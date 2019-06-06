const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const RequestDonorModel = require("./request_donor.model");
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

  addDispatch(request_id, donor_id) {
    let requestDonorModel = new RequestDonorModel({ request: request_id, donor: donor_id });
    return RequestDonorModel.findOneAndUpdate(
      { request: request_id, donor: donor_id },
      { $set: { request: request_id, donor: donor_id } },
      { upsert: true, new: true }
    );
    // return requestDonorModel.save();
  }

  removeDispatch(request_id, donor_id) {
    return RequestDonorModel.findOneAndRemove({ request: request_id, donor: donor_id });
  }

  getAllDispatchByRequest(request_id) {
    return RequestDonorModel.find({ request: request_id }).populate("donor");
  }

  async getDispatchFilter() {
    let requests = [];
    let request_donors = await RequestDonorModel.find({});
    for (var r of request_donors) {
      // var diff = Math.abs(new Date() - r.createdAt);
      let dateTo = new Date(r.updatedAt);
      let dateFrom = new Date();
      let diff =
        dateTo.getMonth() -
        dateFrom.getMonth() +
        12 * (dateTo.getFullYear() - dateFrom.getFullYear());

      // console.log("date difference is ", diff);
      if (diff < 4) {
        requests.push(r);
      }
    }

    return requests;
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
                  address: 1,
                  createdAt: 1,
                  group: { $concat: ["$blood_group", "$rh_factor"] }
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
