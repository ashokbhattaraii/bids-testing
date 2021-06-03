const router = require("express").Router();
const { PM } = require("../../utils");
const RequestController = require("./request.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");
const DonorController = require("../donor/donor.controller");
const donation = require("../../donation");
const inventory = require("../../inventory");
const DonorPlus = require("../donor/donor.model");
var ObjectId = require("mongoose").Types.ObjectId;
const aws = require("../../helpers/services/aws");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000 //size of u file
  }
}).single("image");

router.get("/", SecureAPI(PM.DONOR_LIST), async (req, res, next) => {
  let single = req.query.single || false;
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group || null;
  let requester_phone = req.query.requester_phone || null;
  let name = req.query.name || null;
  let status = req.query.status || null;

  try {
    if (single) {
      results = {};
      if (phone) results = await DonorController.getByPhone(phone);
      res.json(results);
    } else {
      let requests = await RequestController.list({
        limit,
        start,
        group,
        requester_phone,
        name,
        status
      });
      res.json(requests);
    }
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

router.get("/patient-feedback", SecureAPI(PM.DONOR_LIST), async (req, res, next) => {
  let single = req.query.single || false;
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group || null;
  let requester_phone = req.query.requester_phone || null;
  let name = req.query.name || null;
  let status = req.query.status || null;

  try {
    if (single) {
      results = {};
      if (phone) results = await DonorController.getByPhone(phone);
      res.json(results);
    } else {
      let requests = await RequestController.patientFeedbackList({
        limit,
        start,
        group,
        requester_phone,
        name,
        status
      });
      res.json(requests);
    }
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

router.post("/", SecureAPI(), (req, res, next) => {
  req.body.status = "new";
  RequestController.save(req.body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/file-upload", (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400).send(err.message);
    } else if (err) {
      res.status(400).send(err.message);
    } else {
      aws
        .sendFiletoAws(req.file)
        .then(async d => {
          if (d.data.ETag) {
            res.json(`https://assets.rumsan.com/${d.fileData.Key}`);
          } else {
            res.json(d);
          }
        })
        .catch(e => {
          next(e);
        });

    }
  });
});

router.get("/chart-details", SecureAPI(), (req, res, next) => {
  RequestController.getChartDetails(req.query.days)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/:id", SecureAPI(), (req, res, next) => {
  RequestController.get(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/:id/shared-donors", SecureAPI(), (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  RequestController.getAdditionalDonors(limit, start, req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id/new-donors", SecureAPI(), async (req, res, next) => {
  if (req.body.flag === "1") {
    const CreatedUser = await donation.getSpecificUser(req.body.created_by);
    req.body.created_by_name = CreatedUser.name.full;
    RequestController.editadditionalDonor(req.params.id, req.body)
      .then(d => res.json(d))
      .catch(e => next(e));
  } else {
    const CreatedUser = await donation.getSpecificUser(req.body.created_by);
    req.body.created_by_name = CreatedUser.name.full;
    RequestController.additionalDonor(req.params.id, req.body)
      .then(d => res.json(d))
      .catch(e => next(e));
  }
});

router.get("/:id/new-donors-edit", SecureAPI(), (req, res, next) => {
  RequestController.getAdditionalDonorDetail(req.query.phone)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/:id/user", SecureAPI(), async (req, res, next) => {
  let users = await donation
    .getUsersList(req.query.name)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/:id", SecureAPI(), (req, res, next) => {
  RequestController.remove(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/:id/expiry-link", SecureAPI(), (req, res, next) => {
  RequestController.removeExpiryLink(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.patch("/:id", SecureAPI(), async (req, res, next) => {
  let id = req.params.id;
  let request;
  // return
  request = await RequestController.update(id, req.body, "set");
  res.json(request);
});

router.patch("/:id/remove-managed-component", SecureAPI(), async (req, res, next) => {
  let id = req.params.id;

  RequestController.removeManagedComponents(id, req.body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id/documents", SecureAPI(), (req, res, next) => {
  RequestController.update(req.params.id, { documents: req.body }, "addToSet")
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/:id/donor", SecureAPI(), async (req, res, next) => {
  await RequestController.getAllDispatchByRequest(req.params.id)
    .then(data => res.json(data))
    .catch(e => next(e));
});

router.get("/link/:id", SecureAPI(), async (req, res, next) => {
  await RequestController.getSpecificRequestLink(req.params.id)
    .then(data => res.json(data))
    .catch(e => next(e));
});

router.get("/:id/url", SecureAPI(), async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let requestId = req.params.id;
  try {
    let requestsUrl = await RequestController.listUrl({
      limit,
      start,
      requestId
    });
    res.json(requestsUrl);
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

router.post("/:id/donor", SecureAPI(), (req, res, next) => {
  RequestController.addDispatch(req.params.id, req.body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id/donor/feedback", SecureAPI(), (req, res, next) => {
  RequestController.addRequestDonorFeedback(req.params.id, req.body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/:id/donor", SecureAPI(), (req, res, next) => {
  RequestController.removeDispatch(req.params.id, req.body.donor_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/:id/organization", SecureAPI(), (req, res, next) => {
  RequestController.removeOrg(req.params.id, req.body.org_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id/link", SecureAPI(), async (req, res, next) => {
  const created_by = req.cookies.user_id;
  const updated_by = req.cookies.user_id;
  const body = Object.assign({}, req.body, {
    created_by,
    updated_by
  });
  const CreatedUser = await donation.getSpecificUser(body.created_for);
  body.created_for_name = CreatedUser.name.full;
  body.duration = body.duration ? parseInt(body.duration) : 24;
  RequestController.addRequestLink(req.params.id, body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id/link/:linkId", SecureAPI(), (req, res, next) => {
  const created_by = req.cookies.user_id;
  const updated_by = req.cookies.user_id;
  const body = Object.assign({}, req.body, {
    created_by,
    updated_by
  });
  RequestController.updateRequestLink(req.params.id, req.params.linkId, body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/dispatch/:id", SecureAPI(), async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group || null;
  let address = req.query.address || null;
  let name = req.query.name || null;
  let gender = req.query.gender || null;
  let ids = [];
  await RequestController
    .getDispatch(req.params.id, group, address, name, gender, ids, limit, start)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/dispatch/:id", SecureAPI(), async (req, res, next) => {
  let ids = [];
  let request = await RequestController.get(req.params.id);
  for (var d of request.donors) {
    ids.push(d._id);
  }
  let dispatch = await DonorController.dispatch(req.body.group, ids);
  ids = [];
  for (var d of dispatch.data) {
    ids.push(d._id);
  }
  let payload = { donors: ids };
  request = await RequestController.update(req.params.id, payload, "addToSet");
  res.json(request);
});

router.get("/organization/:id", SecureAPI(), async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 25;
  let start = parseInt(req.query.start) || 0;
  let address = req.query.address || null;
  let name = req.query.name || null;

  await inventory
    .getOrganizationsList(name, address, limit, start)
    .then(d => {
      res.json(d.data);

    })
    .catch(e => next(e));
});

module.exports = router;
