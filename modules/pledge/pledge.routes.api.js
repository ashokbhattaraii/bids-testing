const router = require("express").Router();
const PledgeController = require("./pledge.controller");

const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

router.post("/", async (req, res, next) => {
  req.body.gender = 'O';
  PledgeController.add(req.body)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      next(e);
    });
});

router.get("/", async (req, res, next) => {
  const isToday = req.query.today ? true : false;
  const name = req.query.name || null;
  const phone = req.query.phone || null;
  const address = req.query.address || null;
  const group = req.query.group || null;
  const gender = req.query.gender || null;
  const start = req.query.start || 0;
  const limit = req.query.limit || 20;
  PledgeController.list({ isToday, start, limit, name, phone, address, group, gender })
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      next(e);
    });
});

router.get("/:id", async (req, res, next) => {
  PledgeController.getById(req.params.id)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      next(e);
    });
});

router.put("/:id", async (req, res, next) => {
  const payload = req.body;
  PledgeController.update(req.params.id, payload)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      next(e);
    });
});

router.delete("/:id", async (req, res, next) => {
  PledgeController.remove(req.params.id)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      next(e);
    });
});


module.exports = router;
