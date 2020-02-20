const router = require("express").Router();
const { PM } = require("../../utils");
const DonorController = require("./donor.controller");
const v = require("./donor.validations");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");
const donation = require("../../donation");

router.get("/", SecureAPI(PM.DONOR_LIST), async (req, res, next) => {
  await donation
    .getDonorsList()
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });

  // let single = req.query.single || false;
  // let limit = parseInt(req.query.limit) || 20;
  // let start = parseInt(req.query.start) || 0;
  // let group = req.query.group || null;
  // let phone = req.query.phone || null;
  // let name = req.query.name || null;
  // let address = req.query.address || null;

  // try {
  //   if (single) {
  //     results = {};
  //     if (phone) results = await DonorController.getByPhone(phone);
  //     res.json(results);
  //   } else {
  //     let donors = await DonorController.list({
  //       limit,
  //       start,
  //       group,
  //       phone,
  //       name,
  //       address
  //     });
  //     res.json(donors);
  //   }
  // } catch (e) {
  //   console.log(e);
  //   res.json(e);
  // }
});

router.get("/:id", SecureAPI(), (req, res, next) => {
  donation
    .getSpecificDonor(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id", async (req, res, next) => {
  let additionalDonorInfo = {};
  additionalDonorInfo.donor_id = req.params.id;
  additionalDonorInfo.source = req.body.source;
  additionalDonorInfo.comments = req.body.comments;
  additionalDonorInfo.rate = req.body.rate;
  additionalDonorInfo.status = req.body.status;
  await DonorController.save(additionalDonorInfo)
    .then(d => res.json(d))
    .catch(e => next(e));

  await donation
    .editDonors(req.params.id, req.body)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });
});

router.get("/:id/donors_history", SecureAPI(PM.DONOR_LIST), async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  console.log("$$$$$$$$$$ i am here");
  try {
    let donors_history = await DonorController.listDonorHistory({
      limit,
      start
    });
    console.log("&&&&&&&&&&&&&&%%%%%%%%%%%%% this is the donor history", donors_history);
    res.json(donors_history);
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

module.exports = router;
