const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const { TextUtils, ERR, DataUtils } = require("../../utils");
const inventory = require("../../inventory");

class Hospital {
  constructor() {}

  async get(orgId) {
    return inventory.getSpecificOrganization(orgId);
  }
}

module.exports = new Hospital();
