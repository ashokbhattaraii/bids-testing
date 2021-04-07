const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const RequestController = require("./request.controller");
const moment = require("moment");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("request/index", {
    title: "Request List"
  });
});

router.get("/patient-feedback-verify", SecureUI(), async (req, res, next) => {
  res.render("request/patient_feedback", {
    title: "Patient Feedback Verify List"
  });
});

router.get("/charts", SecureUI(), async (req, res, next) => {
  res.render("request/chart", {
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
  var updatedAtDate = new Date(requestLink[0].updatedAt);
  let linkExpiryDate = new Date(
    updatedAtDate.setHours(updatedAtDate.getHours() + parseInt(requestLink[0].duration))
  );

  if (new Date() < linkExpiryDate) {
    res.render("request/shared", {
      title: "Request Shared",
      request: requestLink[0]
    });
  } else {
    res.render("misc/404");
  }
});

router.get("/url/:id", SecureUI(), async (req, res, next) => {
  let requestData = await RequestController.get(req.params.id);

  res.render("request/requestList", {
    title: "Request Dispatch",
    requestId: req.params.id,
    patientName: requestData.patient_name
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

router.get("/report", SecureUI(), async (req, res, next) => {
  const request = await RequestController.list({limit: 25000, start:0});
  let data = request.data;
  data = data.map(d => {
    return {
      "Requestor Name": d.requester_name || '',
      "Requestor Phone": d.requester_phone || '',
      "Patient Name": d.patient_name || '',
      address: d.address || '',
      hospital: d.hospital || '',
      "Blood Group": d.group || '',
      date: moment(d.createdAt).format("lll")
    };
  });
  var xls = json2xls(data);
  var fileName = __dirname + "/../../public/reports/request-report.xlsx";
  fs.writeFile(fileName, xls, "binary", err => {
    if (err) {
      console.log(err);
    }
    res.download(fileName, err => {
      if (err) {
        console.log(err);
      }
      fs.unlink(fileName, err => {
        if (err) {
          console.log(err);
        }
      });
    });
  });
});

module.exports = router;
