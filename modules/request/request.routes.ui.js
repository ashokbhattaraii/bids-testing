const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const RequestController = require("./request.controller");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("request/list", {
    title: "Request List"
  });
});

router.get("/dispatch/:id", SecureUI(), async (req, res, next) => {
  let request = await RequestController.get(req.params.id);
  res.render("request/dispatch", {
    title: "Request Dispatch",
    request
  });
});

router.get("/edit/:id", SecureUI(), async (req, res, next) => {
  let request = await RequestController.get(req.params.id);
  res.render("request/edit", {
    title: "Request Edit",
    request
  });
});

module.exports = router;
