const router = require("express").Router();
const { PM } = require("../../utils");
const DonorController = require("./donor.controller");
const v = require("./donor.validations");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");
const donation = require("../../donation");
const inventory = require("../../inventory");
// let user = JSON.parse(req.cookies.user);
// const DonorController = new Donors({ currentUser: user.id });

router.get("/", SecureAPI(), async (req, res, next) => {
  let start = req.query.start;
  let limit = req.query.limit;
  let group = req.query.group ? req.query.group : "";
  let name = req.query.name ? req.query.name : "";
  let address = req.query.address ? req.query.address : "";
  let phone = req.query.phone ? req.query.phone : "";
  let gender = req.query.gender ? req.query.gender : "";
  await donation
    .getDonorsList(limit, start, group, name, address, phone, gender)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });
});

router.get("/:id", SecureAPI(), (req, res, next) => {
  donation
    .getSpecificDonor(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/organizations/:id", SecureAPI(), (req, res, next) => {
  inventory
    .getSpecificOrganization(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id/history", SecureAPI(), async (req, res, next) => {
  const created_by = req.cookies.user_id;
  const updated_by = req.cookies.user_id;
  const body = Object.assign({}, req.body, {
    created_by,
    updated_by
  });
  await DonorController.save(req.params.id, body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id", SecureAPI(), async (req, res, next) => {
  try {
    let donorBody = {};
    (donorBody.name = req.body.name),
      (donorBody.phone = req.body.phone),
      (donorBody.gender = req.body.gender),
      (donorBody.address = req.body.address),
      (donorBody.last_contacted_date = req.body.lastContacted),
      (donorBody.last_donated_date = req.body.last_donated_date),
      (donorBody.blood_group = req.body.blood_group),
      (donorBody.blood_info = { group: req.body.bloodgroup, rh_factor: req.body.rh_factor }),
      (donorBody.geo_location = req.body.geo_location);

    await donation.editDonors(req.params.id, donorBody);
    let additionalDonorInfo = {};
    additionalDonorInfo.donor_id = req.params.id;
    additionalDonorInfo.source = req.body.source;
    additionalDonorInfo.comments = req.body.comments ? req.body.comments : "";
    additionalDonorInfo.rating = req.body.rate ? req.body.rate : "";
    additionalDonorInfo.status = req.body.status;
    additionalDonorInfo.status_note = req.body.status_note;
    additionalDonorInfo.comm_type = req.body.comm_type;
    await DonorController.save(req.params.id, additionalDonorInfo);
  } catch (e) {
    next(e);
  }
});

router.get("/:id/donors_history", SecureAPI(), async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  try {
    let donors_history = await DonorController.listDonorHistory(limit, start, req.params.id);
    res.json(donors_history);
  } catch (e) {
    res.json(e);
  }
});

router.get("/:id/history", SecureAPI(), async (req, res, next) => {
  await DonorController.get(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

module.exports = router;
