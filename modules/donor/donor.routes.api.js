const router = require("express").Router();
const { PM } = require("../../utils");
const DonorController = require("./donor.controller");
const v = require("./donor.validations");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

router.get("/", SecureAPI(PM.DONOR_LIST), async (req, res, next) => {
  let single = req.query.single || false;
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group || null;
  let phone = req.query.phone || null;
  let name = req.query.name || null;
  try {
    if (single) {
      results = {};
      if (phone) results = await DonorController.getByPhone(phone);
      res.json(results);
    } else {
      let donors = await DonorController.list({
        limit,
        start,
        group,
        phone,
        name
      });
      res.json(donors);
    }
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

module.exports = router;
