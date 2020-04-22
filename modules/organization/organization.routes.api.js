const router = require("express").Router();
const { PM } = require("../../utils");
const HospitalController = require("./organization.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

const inventory = require("../../inventory");

router.get("/", async (req, res, next) => {
  let type = req.query.type || null;
  await inventory
    .getOrganizationsList()
    .then(d => {
      console.log("************* res", res.statusCode);
      if (type) {
        let data = [];
        for (let item of d.data) {
          if (item.type === type) {
            data.push(item);
          }
        }

        let response = {};
        response.total = data.length;
        response.limit = d.limit;
        response.start = d.start;
        response.page = d.page;
        response.data = data;
        res.json(response);
      } else {
        res.json(d);
      }
    })
    .catch(e => {
      console.log(e);
    });
});

router.get("/:id/employee", async (req, res, next) => {
  await inventory
    .getOrganizationsEmployee(req.params.id)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });
});

router.post("/add", async (req, res, next) => {
  await inventory
    .addOrganization(req.body)
    .then(d => res.json(d.data))
    .catch(e => {
      console.log(e);
    });
});

router.post("/:id", async (req, res, next) => {
  await inventory
    .editOrganization(req.params.id, req.body)
    .then(d => res.json(d.data))
    .catch(e => {
      console.log(e);
    });
});

router.delete("/:id", async (req, res, next) => {
  await inventory
    .deleteOrganization(req.params.id)
    .then(d => res.json(d.data))
    .catch(e => {
      console.log(e);
    });
});

module.exports = router;
