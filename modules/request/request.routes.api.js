const router = require("express").Router();
const { PM } = require("../../utils");
const RequestController = require("./request.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");
const DonorController = require("../donor/donor.controller");

router.get("/", SecureAPI(PM.DONOR_LIST), async (req, res, next) => {
  let single = req.query.single || false;
  let limit = parseInt(req.query.limit) || 20;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group || null;
  let requester_phone = req.query.requester_phone || null;
  let name = req.query.name || null;
  let address = req.query.address || null;
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
        address
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
  request = await RequestController.update(id, { requester_name: req.body.requester_name }, "set");
  request = await RequestController.update(
    id,
    { requester_phone: req.body.requester_phone },
    "set"
  );
  request = await RequestController.update(id, { patient_name: req.body.patient_name }, "set");
  request = await RequestController.update(id, { address: req.body.address }, "set");
  request = await RequestController.update(id, { hospital: req.body.hospital }, "set");
  request = await RequestController.update(id, { blood_group: req.body.blood_group }, "set");
  request = await RequestController.update(id, { rh_factor: req.body.rh_factor }, "set");

  res.json(request);
});

router.post("/:id/documents", (req, res, next) => {
  RequestController.update(req.params.id, { documents: req.body }, "addToSet")
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/:id/donor", (req, res, next) => {
  RequestController.getAllDispatchByRequest(req.params.id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/:id/donor", (req, res, next) => {
  RequestController.addDispatch(req.params.id, req.body.donor_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/:id/donor", (req, res, next) => {
  RequestController.removeDispatch(req.params.id, req.body.donor_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.get("/dispatch/:id", SecureAPI(), async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 25;
  let start = parseInt(req.query.start) || 0;
  let group = req.query.group || null;
  let address = req.query.address || null;
  let name = req.query.name || null;
  let ids = [];
  let request_donors = await RequestController.getDispatchFilter();
  for (var d of request_donors) {
    ids.push(d.donor);
  }
  DonorController.dispatch(group, address, name, ids, limit, start)
    .then(d => res.json(d))
    .catch(e => next(e));
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

module.exports = router;
