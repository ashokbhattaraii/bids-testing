const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const RequestController = require("./request.controller");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("request/index", {
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

router.get("/share/:uuid", SecureUI(), async (req, res, next) => {
  let requestLink = await RequestController.getSharedRequestLink(req.params.uuid);
  res.render("request/shared", {
    title: "Request Shared",
    request: requestLink[0]
  });
});

router.get("/url/:id", SecureUI(), async (req, res, next) => {
  res.render("request/requestList", {
    title: "Request Dispatch",
    requestId: req.params.id
  });
});

router.get("/organization/:id", SecureUI(), async (req, res, next) => {
  let request = await RequestController.get(req.params.id);
  res.render("request/organization", {
    title: "Request Dispatch",
    request
  });
});

router.get("/edit/:id", SecureUI(), async (req, res, next) => {
  let request = await RequestController.get(req.params.id);
  let requestDonor = await RequestController.getAllDispatchByRequest(req.params.id);
  requestDonor = JSON.stringify(requestDonor);

  res.render("request/edit", {
    title: "Request Edit",
    requestDonor,
    request
  });
});

module.exports = router;
