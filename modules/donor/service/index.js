const { TextUtils } = require("../../../utils");
const DonorStaticModel = require("./donorStatic.model");
const DonorHistoryModel = require("../donor.model");
const { DataUtils } = require("../../../helpers/utils");
class service {
  getById(donorId) {
    return DonorStaticModel.findById(donorId);
  }

  getByPhone(phone) {
    return DonorStaticModel.findOne({ phone: phone });
  }

  async list({ limit, start, group, phone, name, address }) {
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
    } else if (address) {
      const regex = new RegExp(TextUtils.escapeRegex(address), "gi");
      query = {
        address: {
          $regex: regex
        }
      };
    }
    return new Promise(async (resolve, reject) => {
      await DonorStaticModel.aggregate([
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
                  address: 1,
                  blood_group: { $concat: ["$blood_info.group", "$blood_info.rh_factor"] },
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

  findEligibleDonors(group, address, name, donorids, limit, start) {
    if (!donorids) {
      donorids = [];
    }
    let query = {};
    if (group) {
      query = {
        blood_group: group
      };
    }

    if (group && address) {
      const regex = new RegExp(TextUtils.escapeRegex(address), "gi");
      query = {
        blood_group: group,
        address: {
          $regex: regex
        }
      };
    }

    if (group && name) {
      const regex = new RegExp(TextUtils.escapeRegex(name), "gi");
      query = {
        blood_group: group,
        name: {
          $regex: regex
        }
      };
    }
    console.log(query);
    return new Promise((resolve, reject) => {
      DonorStaticModel.aggregate([
        {
          $facet: {
            data: [
              {
                $match: query
              },
              { $match: { _id: { $nin: donorids } } },
              {
                $project: {
                  name: 1,
                  address: 1,
                  phone: 1,
                  email: 1,
                  age: 1,
                  gender: 1,
                  dob: 1,
                  blood_group: { $concat: ["$blood_info.group", "$blood_info.rh_factor"] },
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
              data: d[0].data
            });
          else
            resolve({
              total: 0,
              limit,
              data: []
            });
        })
        .catch(e => reject(e));
    });
  }

  async donorHistoryList({ start, limit }) {
    return DataUtils.paging({
      start,
      limit,
      sort: { created_at: 1 },
      model: DonorHistoryModel,
      query: [],
      $facet: {
        data: [
          {
            $project: {
              source: 1,
              rate: 1,
              comments: 1,
              status: 1
            }
          },
          {
            $skip: start
          },
          {
            $limit: limit
          }
        ]
      }
    });
  }
}

module.exports = new service();
