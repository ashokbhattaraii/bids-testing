const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const { TextUtils, ERR, DataUtils } = require("../../utils");
const inventory = require("../../inventory");

class Pledge {
  constructor() { }

  async getFormData() {
    return ("this is form data")
  }
}

module.exports = new Pledge();
