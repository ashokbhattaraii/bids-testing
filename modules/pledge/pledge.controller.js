const mongoose = require("mongoose");
const moment = require("moment");
const PledgeModel = require("../donor/unverifiedDonor.model");
const { DataUtils } = require("../../utils");

class Pledge {
  constructor() { }

  add(payload) {
    return PledgeModel.create(payload);
  }

  list({ isToday, start, limit, name, phone, address, group, gender }) {
    const query = [
      {
        '$match': {
          'request': {
            '$ne': null
          }
        }
      }
    ];
    if (name) {
      query.push(
        {
          '$match': {
            'name': name
          }
        }
      )
    }
    if (phone) {
      query.push(
        {
          '$match': {
            'phone': phone
          }
        }
      )
    }
    if (address) {
      query.push(
        {
          '$match': {
            'address': address
          }
        }
      )
    }
    if (group) {
      query.push(
        {
          '$match': {
            'group': group
          }
        }
      )
    }
    if (gender) {
      query.push(
        {
          '$match': {
            'gender': gender
          }
        }
      )
    }
    if (isToday) {
      const today = moment().startOf('day').format();
      const tomorrow = moment().add(1, 'days').startOf('day').format();
      query.push(
        {
          '$match': {
            'created_at': {
              '$gte': new Date(today),
              '$lt': new Date(tomorrow)
            }
          }
        }
      );
    }

    return DataUtils.paging({
      start,
      limit,
      sort: { created_at: -1 },
      model: PledgeModel,
      query
    });
  }

  getById(id) {
    return PledgeModel.findOne(id);
  }

  update(id, payload) {
    return PledgeModel.findOneAndUpdate(id, payload);
  }

  remove(id) {
    return PledgeModel.findOneAndDelete(id);
  }



}

module.exports = new Pledge();
