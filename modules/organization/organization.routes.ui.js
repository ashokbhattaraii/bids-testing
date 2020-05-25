const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const inventory = require("../../inventory");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("organizations/add"),
    {
      title: "Organization add"
    };
});

router.get("/:id", SecureUI(), async (req, res, next) => {
  res.render("organizations/edit", {
    title: "Organization Edit",
    organization: { id: req.params.id }
  });
});

router.get("/employee/:emp_id", SecureUI(), async (req, res, next) => {
  inventory
    .getOrganizationsEmployeeDetail(req.params.emp_id)
    .then(d => {
      res.render("organizations/employeeDetail", {
        title: "View Employee",
        employeeId: d._id
      });
    })
    .catch(next);
});

module.exports = router;
