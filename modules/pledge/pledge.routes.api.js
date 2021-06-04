const router = require("express").Router();
const PledgeController = require("./pledge.controller");
const RequestController = require("../request/request.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

router.post("/", SecureAPI(), async (req, res, next) => {
  let formData = req.body;
  RequestController.update(req.body._id, req.body)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });
});

module.exports = router;
