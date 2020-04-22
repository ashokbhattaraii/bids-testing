const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const OrgController = require("./organization.controller");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("organizations/add"),
    {
      title: "Organization add"
    };
});

router.get("/:id", SecureUI(), async (req, res, next) => {
  res.render("organizations/edit", {
    title: "Organization Edit",
    organization: { id: req.params.id }
  });
});

module.exports = router;
