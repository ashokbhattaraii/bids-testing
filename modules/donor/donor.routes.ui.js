const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const DonorController = require("./donor.controller");
const donation = require("../../donation");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("donor/index", {
    title: "Donor List"
  });
});

router.get("/edit/:id", SecureUI(), async (req, res, next) => {
  let donor = await donation.getSpecificDonor(req.params.id);
  res.render("donor/edit", {
    title: "Donor Edit",
    donor
  });
});

module.exports = router;
