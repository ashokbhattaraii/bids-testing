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
  let organization = await OrgController.get(req.params.id);
  console.log("**************########### this is the org detail", organization);
  res.render("organizations/edit", {
    title: "Organization Edit",
    organization
  });
});

module.exports = router;
