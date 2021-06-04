const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
var ObjectId = require("mongoose").Types.ObjectId;
const RequestDonorModel = require("./request_donor.model");
const RequestDonorFeedbackModel = require("./donor_feedback.model");
const RequestModel = require("./request.model");
const RequestLinkModel = require("./request_link.model");
const donation = require("../../donation");
const DonorController = require("../donor/donor.controller");
const { uuid } = require("uuidv4");
const { TextUtils, ERR, DataUtils } = require("../../utils");
const config = require("config");

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

  async removeManagedComponents(id, payload) {
    return RequestModel.findOneAndUpdate(
      { _id: id },
      { $pull: { managed_products: { blood_type: payload.type } } },
      { new: true }
    );
  }

  getSpecificRequestLink(id) {
    return RequestLinkModel.findById(id);
  }

  getAdditionalDonorDetail(phone_no) {
    return RequestModel.find({ additional_donors: { $elemMatch: { phone: phone_no } } });
  }

  addRequestDonorFeedback(reqId, payload) {
    payload.request = reqId;
    return RequestDonorFeedbackModel.findOneAndUpdate(
      { donor: payload.donor },
      { $set: payload },
      { upsert: true, new: true }
    );
  }

  getSharedRequestLink(id) {
    return RequestLinkModel.find({ urlLink_id: id });
  }

  removeExpiryLink(urlId) {
    return RequestLinkModel.findByIdAndDelete(urlId);
  }

  addRequestLink(request_id, payload) {
    let urlId = uuid();
    payload.request = request_id;
    payload.urlLink_id = urlId;
    payload.url = config.get("app.url") + `/requests/share/${urlId}`;
    return RequestLinkModel.create(payload);
  }

  additionalDonor(requestId, payload) {
    return RequestModel.findOneAndUpdate(
      { _id: requestId },
      {
        $addToSet: {
          additional_donors: {
            name: payload.name,
            phone: payload.phone,
            address: payload.address,
            created_by: payload.created_by,
            created_by_name: payload.created_by_name
          }
        }
      },
      { upsert: true, new: true }
    );
  }

  editadditionalDonor(requestId, payload) {
    return RequestModel.updateOne(
      {
        _id: requestId,
        additional_donors: { $elemMatch: { phone: payload.donor_phone } }
      },
      {
        $set: {
          "additional_donors.$.name": payload.name,
          "additional_donors.$.phone": payload.phone,
          "additional_donors.$.address": payload.address,
          "additional_donors.$.created_by": payload.created_by,
          "additional_donors.$.created_by_name": payload.created_by_name
        }
      },
      { new: true }
    );
  }

  updateRequestLink(request_id, linkId, payload) {
    let lId = mongoose.Types.ObjectId(linkId);
    let createdFor = mongoose.Types.ObjectId(payload.created_for);

    return RequestLinkModel.findOneAndUpdate(
      { _id: lId },
      {
        $set: {
          request: request_id,
          duration: payload.duration,
          url: payload.url,
          created_for: createdFor,
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

  async getAdditionalDonors(limit, start, requestId) {
    let page = parseInt(start) / parseInt(limit) + 1;
    let reqId = mongoose.Types.ObjectId(requestId);
    return new Promise((resolve, reject) => {
      RequestModel.aggregate([
        {
          $facet: {
            data: [
              {
                $project: {
                  additional_donors: 1
                }
              },
              {
                $match: { _id: reqId }
              },
              {
                $skip: start
              },
              {
                $limit: limit
              }
            ]
          }
        }
      ])
        .then(d => {
          if (d[0].data[0].additional_donors) {
            if (d[0].data[0].additional_donors.length > 0) {
              resolve({
                total: d[0].data[0].additional_donors.length,
                limit,
                start,
                page,
                data: d[0].data[0].additional_donors
              });
            }
          } else {
            resolve({
              total: 0,
              limit,
              start,
              page,
              data: []
            });
          }
        })
        .catch(e => reject(e));
    });
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
                  request_type: 1,
                  status: 1,
                  createdAt: 1,
                  patient_feedback_verification: 1,
                  patient_feedback_status: 1,
                  request_managed_from: 1,
                  group: { $concat: ["$blood_group", "$rh_factor"] },
                  pledge: 1
                }
              },
              {
                $match: query
              },
              { $sort: { createdAt: -1 } },
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

  todayList({ limit, start }) {
    let page = parseInt(start) / parseInt(limit) + 1;
    return new Promise((resolve, reject) => {
      var day = new Date();
      var nextDay = new Date(day);

      day.setHours(0, 0, 0);
      nextDay.setHours(0, 0, 0);

      nextDay.setDate(day.getDate() + 1);
      function getFormattedDate(dateString) {
        var date = new Date(dateString);
        date.setHours(0, 0, 0); // Set hours, minutes and seconds
        return date.toString();
      }
      let today = getFormattedDate(day);
      let tomorrow = getFormattedDate(nextDay);
      RequestModel.aggregate([
        {
          $facet: {
            data: [
              {
                $project: {
                  hospital: 1,
                  hospital_address: 1,
                  blood_group: 1,
                  requested_products: 1,
                  requested_date: 1,
                  diagnosis: 1,
                  request_type: 1,
                  urgency: 1,
                  total_pints_blood: 1,
                  status: 1,
                  createdAt: 1,
                  managed: 1,
                  pledge: 1
                }
              },
              {
                $match: {
                  $or: [
                    {
                      status: "new"
                    },
                    {
                      status: "in-progress"
                    },
                    { status: "pending" }
                  ]
                }
              },
              {
                $match: {
                  createdAt: {
                    $gte: new Date(today),
                    $lt: new Date(tomorrow)
                  }
                }
              },
              { $sort: { createdAt: -1 } },
              {
                $skip: start
              },
              {
                $limit: limit
              }
            ],
            managed: [
              {
                $project: {
                  hospital: 1,
                  hospital_address: 1,
                  blood_group: 1,
                  requested_date: 1,
                  diagnosis: 1,
                  request_type: 1,
                  urgency: 1,
                  status: 1,
                  createdAt: 1,
                  managed_products: 1
                }
              },
              {
                $match: {
                  createdAt: {
                    $gte: new Date(today),
                    $lt: new Date(tomorrow)
                  }
                }
              },
              {
                $match: {
                  status: "managed"
                }
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
              limit,
              start,
              page,
              data: d[0].data,
              managed: d[0].managed
            });
          else
            resolve({
              limit,
              start,
              page,
              data: [],
              managed: []
            });
        })
        .catch(e => reject(e));
    });
  }

  async getDispatch(id, group, address, name, gender, donorids, limit, start) {
    let donorData = await donation.dispatch(
      id,
      group,
      address,
      name,
      gender,
      donorids,
      limit,
      start
    );

    return await DonorController.getAverageRating(donorData);
  }

  patientFeedbackList({ limit, start, group, requester_phone, name, status }) {
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
                  request_type: 1,
                  status: 1,
                  createdAt: 1,
                  patient_feedback: 1,
                  request_managed_from: 1,
                  group: { $concat: ["$blood_group", "$rh_factor"] },
                  order: {
                    $cond: {
                      if: { $eq: ["$patient_feedback.status", "!contacted"] },
                      then: 1,
                      else: {
                        $cond: {
                          if: { $eq: ["$patient_feedback.status", "pending"] },
                          then: 2,
                          else: {
                            $cond: {
                              if: { $eq: ["$patient_feedback.status", "received"] },
                              then: 3,
                              else: 4
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              {
                $match: query
              },
              { $sort: { order: 1, createdAt: -1 } },
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
                  created_for_name: 1,
                  url: 1,
                  duration: 1,
                  createdAt: 1
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

  getChartDetails(days) {
    // var d = new Date();
    //   d.setDate(d.getDate()-7);
    return new Promise((resolve, reject) => {
      RequestModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000) }
          }
        }
      ])
        .then(d => {
          resolve({
            data: d
          });
        })
        .catch(e => reject(e));
    });
  }

  async getReports(date) {
    if (date) {
      return await RequestModel.find({
        updatedAt: {
          $gte: date,
          $lte: new Date()
        }
      }).sort({ name: "asc" });
    } else {
      return await RequestModel.find({}).sort({ name: "asc" });
    }
  }
}

module.exports = new Request();
