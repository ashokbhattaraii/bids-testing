const router = require("express").Router();
const PledgeController = require("./pledge.controller");

const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

router.post("/", SecureAPI(), async (req, res, next) => {
  let data = {
    name: req.body.name,
    address: req.body.address,
    contact: req.body.contact,
    requestId: req.body.id
  };
  PledgeController.add(data)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      next(e);
    });
});

router.get("/", SecureAPI(), async (req, res, next) => {
  let start = req.query.start || 0;
  let limit = req.query.limit || 20;
  let name = req.query.name || null;

  PledgeController.list({ start, limit, name })
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      next(e);
    });
});

router.put("/:id", SecureAPI(), async (req, res, next) => {
  PledgeController.update(req.params.id, req.body)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      next(e);
    });
});

module.exports = router;
