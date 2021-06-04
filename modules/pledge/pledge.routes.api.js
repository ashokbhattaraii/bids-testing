const router = require("express").Router();
const { PM } = require("../../utils");
const PledgeController = require("./pledge.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

const inventory = require("../../inventory");

router.get("/", SecureAPI(), async (req, res, next) => {
  PledgeController.getFormData()
    .then(d => {
      res.json(d)
    })
    .catch(e => {
      console.log(e);
    });
});



module.exports = router;
