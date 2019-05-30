const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const DonationService = require("../../services/donation");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("donor/list", {
    title: "Donor List"
  });
});

module.exports = router;
