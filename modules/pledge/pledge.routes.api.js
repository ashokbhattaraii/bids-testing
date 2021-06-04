const router = require("express").Router();
const PledgeController = require("./pledge.controller");
const RequestController = require("../request/request.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

router.post("/", SecureAPI(), async (req, res, next) => {
  console.log("inside pledge post");
  data = {
    pledge: {
      name: "new donator",
      address: "new donator address",
      contact: " new donator contact"
    }
  };
  let id = "60ba0caa0cce0c40cc7b5d0b";
  RequestController.update(id, data, "push")
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });
});

module.exports = router;
