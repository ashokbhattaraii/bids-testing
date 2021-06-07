const router = require("express").Router();
const PledgeController = require("./pledge.controller");
const RequestController = require("../request/request.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

router.post("/", SecureAPI(), async (req, res, next) => {
  let id = req.body.id;
  let data = {
    pledge: {
      name: req.body.name,
      address: req.body.address,
      contact: req.body.contact
    }
  }
  RequestController.update(id, data, "push")
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });
});

module.exports = router;
