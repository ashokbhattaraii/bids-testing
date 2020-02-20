const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const RequestController = require("./organization.controller");

router.get("/:id", SecureUI(), async (req, res, next) => {
  res.render("organizations/edit", {
    title: "Organization Edit"
  });
});

module.exports = router;
