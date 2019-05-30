const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("request/list", {
    title: "Request List"
  });
});

module.exports = router;
