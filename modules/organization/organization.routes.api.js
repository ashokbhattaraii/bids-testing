const router = require("express").Router();
const { PM } = require("../../utils");
const HospitalController = require("./organization.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");

const inventory = require("../../inventory");

router.get("/", SecureAPI(), async (req, res, next) => {
  let type = req.query.type || null;
  let name = req.query.name || null;
  await inventory
    .getOrganizationsList()
    .then(d => {
      if (type || name) {
        let data = [];
        for (let item of d.data) {
          if (type && item.type === type) {
            data.push(item);
          }
          if (name && new RegExp(name, "gi").test(item.name)) {
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

router.get("/:id/employee", SecureAPI(), async (req, res, next) => {
  await inventory
    .getOrganizationsEmployee(req.params.id)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });
});

router.post("/:id/employee", SecureAPI(), async (req, res, next) => {
  await inventory
    .addOrganizationsEmployee(req.params.id, req.body)
    .then(d => res.json(d.data))
    .catch(e => {
      console.log(e);
    });
});

router.get("/employee/:emp_id", SecureAPI(), async (req, res, next) => {
  await inventory
    .getOrganizationsEmployeeDetail(req.params.emp_id)
    .then(d => {
      res.json(d);
    })
    .catch(e => {
      console.log(e);
    });
});

router.post("/add", SecureAPI(), async (req, res, next) => {
  await inventory
    .addOrganization(req.body)
    .then(d => res.json(d.data))
    .catch(e => {
      console.log(e);
    });
});

router.post("/:id", SecureAPI(), async (req, res, next) => {
  await inventory
    .editOrganization(req.params.id, req.body)
    .then(d => res.json(d.data))
    .catch(e => {
      console.log(e);
    });
});

router.delete("/:id", SecureAPI(), async (req, res, next) => {
  await inventory
    .deleteOrganization(req.params.id)
    .then(d => res.json(d.data))
    .catch(e => {
      console.log(e);
    });
});

router.post("/employee/:employee_id/roles", SecureAPI(), async (req, res, next) => {
  inventory
    .addOrgEmployeeRole(req.body, req.params.employee_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.post("/employee/:employee_id", SecureAPI(), async (req, res, next) => {
  inventory
    .editOrgEmployee(req.body, req.params.employee_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

router.delete("/employee/:employee_id/roles", SecureAPI(), async (req, res, next) => {
  inventory
    .removeOrgEmployeeRole(req.body, req.params.employee_id)
    .then(d => res.json(d))
    .catch(e => next(e));
});

module.exports = router;
