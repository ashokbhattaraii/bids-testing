const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
var ObjectId = require("mongoose").Types.ObjectId;
const RequestDonorModel = require("./request_donor.model");
const RequestModel = require("./request.model");
const RequestLinkModel = require("./request_link.model");
const DonorModel = require("../donor/donor.model");
const { uuid } = require("uuidv4");
const { TextUtils, ERR, DataUtils } = require("../../utils");

class Request {
  constructor() {}

  splitBlood(blood) {
    let rh_factor = blood.match(/\+|-/);
    rh_factor = rh_factor[0].toString();
    let group = blood.replace(/\+|-/, "");
    return { rh_factor, group };
  }
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

  getSpecificRequestLink(id) {
    return RequestLinkModel.findById(id);
  }

  addRequestLink(request_id, payload) {
    let urlId = uuid();
    payload.request = request_id;
    payload.urlLink_id = urlId;
    payload.url = `/api/v1/request/${urlId}/add`;
    return RequestLinkModel.create(payload);
  }

  updateRequestLink(request_id, linkId, payload) {
    let lId = mongoose.Types.ObjectId(linkId);
    payload.request = request_id;

    return RequestLinkModel.findOneAndUpdate(
      { _id: lId },
      {
        $set: {
          request: request_id,
          duration: payload.duration,
          created_for: payload.created_for,
          created_by: payload.created_by,
          updated_by: payload.updated_by
        }
      },
      { upsert: true, new: true }
    );
  }

  addDispatch(request_id, dispatch_detail) {
    let org_id = dispatch_detail.organization ? dispatch_detail.organization : [];
    let donor_id = dispatch_detail.donor ? dispatch_detail.donor : [];
    let requestDonorModel = new RequestDonorModel({
      request: request_id,
      organization: org_id,
      donor: donor_id,
      type: dispatch_detail.type
    });
    if (org_id.length === 0 && donor_id.length > 0) {
      return RequestDonorModel.findOneAndUpdate(
        { request: request_id },
        {
          $set: {
            request: request_id,
            donor: donor_id,
            type: dispatch_detail.type
          }
        },
        { upsert: true, new: true }
      );
    } else if (donor_id.length === 0 && org_id.length > 0) {
      return RequestDonorModel.findOneAndUpdate(
        { request: request_id },
        {
          $set: {
            request: request_id,
            organization: org_id,
            type: dispatch_detail.type
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  removeDispatch(request_id, donor_id) {
    return RequestDonorModel.update({ request: request_id }, { $pull: { donor: donor_id } });
  }

  removeOrg(request_id, org_id) {
    return RequestDonorModel.update({ request: request_id }, { $pull: { organization: org_id } });
  }

  getAllDispatchByRequest(request_id) {
    return RequestDonorModel.find({ request: request_id });
  }

  async getDispatchFilter() {
    let requests = [];
    let request_donors = await RequestDonorModel.find({});
    for (var r of request_donors) {
      var dateTo = moment(new Date(r.updatedAt), "M/D/YYYY");
      var dateFrom = moment(new Date(), "M/D/YYYY");
      var diffDays = dateFrom.diff(dateTo, "days");
      if (diffDays <= 90) {
        requests.push(r.donor ? r.donor : "");
      }
    }
    return requests;
  }

  remove(requestId) {
    return RequestModel.findByIdAndDelete(requestId);
  }

  async get(requestId) {
    return RequestModel.findById(requestId).populate("request_donors");
  }

  getByName(name) {
    return RequestModel.findOne({ name: name });
  }

  list({ limit, start, group, requester_phone, name, status }) {
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
    } else if (name) {
      const regex = new RegExp(TextUtils.escapeRegex(name), "gi");
      query = {
        $or: [
          {
            requester_name: {
              $regex: regex
            }
          },

          {
            patient_name: {
              $regex: regex
            }
          }
        ]
      };
    } else if (status) {
      query = {
        status: status
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
                  requested_date: 1,
                  status: 1,
                  createdAt: 1,
                  group: { $concat: ["$blood_group", "$rh_factor"] }
                }
              },
              {
                $match: query
              },
              {
                $sort: {
                  _id: -1
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

  listUrl({ limit, start, requestId }) {
    let page = parseInt(start) / parseInt(limit) + 1;
    let reqId = mongoose.Types.ObjectId(requestId);
    return new Promise((resolve, reject) => {
      RequestLinkModel.aggregate([
        {
          $facet: {
            data: [
              {
                $project: {
                  request: 1,
                  created_for: 1,
                  url: 1,
                  duration: 1
                }
              },
              {
                $match: { request: reqId }
              },
              {
                $sort: {
                  _id: -1
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
