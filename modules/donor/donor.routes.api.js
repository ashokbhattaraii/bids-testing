const router = require("express").Router();
const { PM } = require("../../utils");
const DonorController = require("./donor.controller");
const v = require("./donor.validations");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");
const donation = require("../../donation");
const inventory = require("../../inventory");

const multer = require("multer");

//Upload xlsx
const storage = multer.diskStorage({
  destination: __dirname + "/../../public/data/",
  filename(req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, callback) {
    //file filter
    if (
      ["xls", "xlsx"].indexOf(
        file.originalname.split(".")[file.originalname.split(".").length - 1]
      ) === -1
    ) {
      return callback(new Error("Wrong extension type"));
    }
    callback(null, true);
  }
});

router.get("/unverified", SecureAPI(), async (req, res, next) => {
  let single = req.query.single || false;
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group ? req.query.group : "";
  let page = req.query.page ? req.query.page : "";
  let source = req.query.source ? req.query.source : "";
  let phone = req.query.phone ? req.query.phone : "";
  let name = req.query.name ? req.query.name : "";
  let address = req.query.address ? req.query.address : "";
  let gender = req.query.gender ? req.query.gender : "";
  let is_verified = req.query.is_verified === "true" ? true : false;

  try {
    if (single) {
      results = {};
      if (phone) results = await DonorController.getByPhone(phone);
      res.json(results);
    } else {
      let donors = await DonorController.unverifiedList({
        limit,
        start,
        group,
        phone,
        name,
        address,
        source,
        page,
        gender,
        is_verified
      });
      res.json(donors);
    }
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

router.get("/", SecureAPI(), async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group ? req.query.group : "";
  let name = req.query.name ? req.query.name : "";
  let address = req.query.address ? req.query.address : "";
  let phone = req.query.phone ? req.query.phone : "";
  let gender = req.query.gender ? req.query.gender : "";
  let is_active = req.query.is_active ? req.query.is_active : "";
  let has_blood_group = req.query.has_blood_group ? req.query.has_blood_group : "";
  let excludeTeams = true; // to exclude donors of CBTS team & other teams specified in config file of donation app

  await DonorController.getDonorsList(
    limit,
    start,
    group,
    name,
    address,
    phone,
    gender,
    is_active,
    has_blood_group,
    excludeTeams
  )
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

router.post("/add-rating", SecureAPI(), async (req, res, next) => {
  const created_by = req.cookies.user_id;
  const updated_by = req.cookies.user_id;
  const body = Object.assign({}, req.body, {
    created_by,
    updated_by
  });

  await DonorController.saveRating(body)
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
  donorBody.email = req.body.email;
  donorBody.dob = req.body.dob;
  await donation.editDonors(req.params.id, donorBody);
  let additionalDonorInfo = {};
  additionalDonorInfo.donor_id = req.params.id;
  additionalDonorInfo.source = req.body.source;
  additionalDonorInfo.status = req.body.status;
  additionalDonorInfo.status_note = req.body.status_note;
  await DonorController.save(req.params.id, additionalDonorInfo)
    .then(d => res.json(d))
    .catch(e => next(e));
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
  await DonorController.getDonorHistory(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/:id/rating", SecureAPI(), async (req, res, next) => {
  await DonorController.getDonorRating(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/unverified/add", SecureAPI(), (req, res, next) => {
  const created_by = req.tokenData.user_id;
  const updated_by = req.tokenData.user_id;
  const body = Object.assign({}, req.body, {
    created_by,
    updated_by
  });
  DonorController.saveUnverified(body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/unverified/add-bulk", SecureAPI(), (req, res, next) => {
  DonorController.extractEachFileJSON(req.body.data)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/unverified/upload", upload.single("file"), (req, res, next) => {
  if (req.file && req.file.filename) {
    const filePath = req.file.path;
    DonorController.excelToJSONUnverified(filePath)
      .then(d => res.json(d))
      .catch(e => next(e));
  }
});

router.post("/verified/upload", upload.single("file"), (req, res, next) => {
  if (req.file && req.file.filename) {
    const filePath = req.file.path;
    DonorController.excelToJSONVerified(filePath)
      .then(d => res.json(d))
      .catch(e => next(e));
  }
});

router.get("/unverified/:id", SecureAPI(), (req, res, next) => {
  DonorController.getUnverifiedDonor(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/unverified/:id", SecureAPI(), (req, res, next) => {
  DonorController.removeUnverifiedDonor(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/unverified/:id/verify", SecureAPI(), async (req, res, next) => {
  let payload = await DonorController.getUnverifiedDonor(req.params.id);
  DonorController.editUnverifiedStatus(payload)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.put("/:id/status", SecureAPI(), async (req, res, next) => {
  donation
    .changeDonorStatus(req.params.id, req.body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

module.exports = router;
