const router = require("express").Router();
const { PM } = require("../../utils");
const RequestController = require("./request.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");
const DonorController = require("../donor/donor.controller");
const donation = require("../../donation");
const inventory = require("../../inventory");
const DonorPlus = require("../donor/donor.model");
var ObjectId = require("mongoose").Types.ObjectId;

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

router.post("/", (req, res, next) => {
  req.body.status = "new";
  RequestController.save(req.body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/:id", (req, res, next) => {
  RequestController.get(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/:id", (req, res, next) => {
  RequestController.remove(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.patch("/:id", async (req, res, next) => {
  let id = req.params.id;
  let request;
  request = await RequestController.update(id, req.body, "set");
  res.json(request);
});

router.post("/:id/documents", (req, res, next) => {
  RequestController.update(req.params.id, { documents: req.body }, "addToSet")
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/:id/donor", async (req, res, next) => {
  await RequestController.getAllDispatchByRequest(req.params.id)
    .then(data => res.json(data))
    .catch(e => next(e));
});

router.post("/:id/donor", (req, res, next) => {
  RequestController.addDispatch(req.params.id, req.body)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/:id/donor", (req, res, next) => {
  RequestController.removeDispatch(req.params.id, req.body.donor_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/:id/organization", (req, res, next) => {
  RequestController.removeOrg(req.params.id, req.body.org_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/dispatch/:id", SecureAPI(), async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 25;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group || null;
  let address = req.query.address || null;
  let name = req.query.name || null;
  let gender = req.query.gender || null;
  let ids = await RequestController.getDispatchFilter();
  await donation
    .dispatch(req.params.id, group, address, name, gender, ids, limit, start)
    .then(d => res.json(d))
    .catch(e => next(e));

  // let donor_history = await DonorPlus.find();
  // // console.log("$$$$$$$$$ this is the donor history", donor_history);
  // let average_rate = 0;
  // for (var i = 0; i < donor_history.length; i++) {
  //   for (var j = 0; j < donor_history[i].rate.length; j++) {
  //     console.log("EEEEEEEEEEEEE this is the rate", donor_history[i].rate[j]);
  //     average_rate = average_rate + donor_history[i].rate[j];
  //   }
  //   return;
  // }
});

router.post("/dispatch/:id", async (req, res, next) => {
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
  await inventory
    .getOrganizationsList(limit, start)
    .then(d => res.json(d))
    .catch(e => next(e));
});

module.exports = router;
