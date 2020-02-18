const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const RequestController = require("./organization.controller");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("hospital/list", {
    title: "Hospital List"
  });
});

router.get("/add", SecureUI(), async (req, res, next) => {
  res.render("hospital/add", {
    title: "Hospital Add"
  });
});

module.exports = router;
