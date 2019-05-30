const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const DonationService = require("../../services/donation");

router.get("/", async (req, res, next) => {
  let data = await DonationService.auth();
  res.render("donor/list", {
    title: "Donor List",
    token: data.token
  });
});

module.exports = router;
