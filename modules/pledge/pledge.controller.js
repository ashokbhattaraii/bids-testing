const mongoose = require("mongoose");
const _ = require("lodash");

const PledgeModel = require("./pledge.model");

class Pledge {
  constructor() {}

  add(payload) {
    console.log(payload.requestId);
    payload.requestId = mongoose.Types.ObjectId(payload.requestId);
    console.log(payload.requestId);
    return PledgeModel.create(payload);
  }

  list({ start, limit, name }) {
    let page = parseInt(start) / parseInt(limit) + 1;
    let query = {};

    return new Promise((resolve, reject) => {
      PledgeModel.aggregate([
        {
          $facet: {
            data: [
              {
                $project: {
                  name: 1,
                  address: 1,
                  contact: 1,
                  requestId: 1
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

  update(id, payload) {
    return PledgeModel.findOneAndUpdate(id, payload);
  }
}

module.exports = new Pledge();
