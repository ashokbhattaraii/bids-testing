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
        gender
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
  await DonorController
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

  await donation.editDonors(req.params.id, donorBody);
  let additionalDonorInfo = {};
  additionalDonorInfo.donor_id = req.params.id;
  additionalDonorInfo.source = req.body.source;
  additionalDonorInfo.comments = req.body.comments ? req.body.comments : "";
  additionalDonorInfo.rating = req.body.rate ? req.body.rate : "";
  additionalDonorInfo.status = req.body.status;
  additionalDonorInfo.status_note = req.body.status_note;
  additionalDonorInfo.comm_type = req.body.comm_type;
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
  await DonorController.get(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/changeStatus/:id", SecureAPI(), (req, res, next) => {
  DonorController.editUnverifiedStatus(req.body, req.params.id)
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

router.post("/unverified/upload",upload.single("file"), (req, res, next) => {
  if (req.file && req.file.filename) {
    const filePath = req.file.path;
    DonorController.excelToJSON(filePath)
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

module.exports = router;
