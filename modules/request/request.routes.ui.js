const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const RequestController = require("./request.controller");
var json2xls = require("json2xls");
var fs = require("fs");
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
  const request = await RequestController.list({ limit: 25000, start: 0 });
  let data = request.data;
  data = data.map(d => {
    return {
      "Requestor Name": d.requester_name || "",
      "Requestor Phone": d.requester_phone || "",
      "Patient Name": d.patient_name || "",
      address: d.address || "",
      hospital: d.hospital || "",
      "Blood Group": d.group || "",
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

router.get("/full-report", SecureUI(), async (req, res, next) => {
  let { data } = await RequestController.list({ limit: 25000, start: 0 });
  data = data.map(d => {
    let requested_products = d.requested_products && d.requested_products.length > 0 && d.requested_products.map(d => { return Object.values(d).reverse().join("|") });
    requested_products = requested_products && requested_products.length > 0 ? requested_products.join(' , ') : '';
    let managed_products = d.managed_products && d.managed_products.length > 0 && d.managed_products.map(d => { return Object.values(d).join("|") });
    managed_products = managed_products && managed_products.length > 0 ? managed_products.join(' , ') : '';
    return {
      "Requestor Name": d.requester_name || "",
      "Requestor Phone": d.requester_phone || "",
      "Patient Name": d.patient_name || "",
      address: d.address || "",
      hospital: d.hospital || "",
      "Blood Group": d.group || "",
      "Request Created date": moment(d.createdAt).format("lll"),
      urgency: d.urgency,
      source: d.source,
      "Requested Date": moment(d.requested_date).format("lll"),
      "Total Pints Blood": d.total_pints_blood,
      status: d.status,
      "referred By": d.referred_by,
      "request handled by": d.request_handled_by,
      "request managed from": d.request_managed_from,
      "Transportation Required": d.transportation_required,
      "patient feedback": d.patient_feedback && d.patient_feedback.status ? d.patient_feedback.status : '',
      "Requested Products": requested_products,
      "Managed Products": managed_products
    };
  });
  var xls = json2xls(data);
  var fileName = __dirname + "/../../public/reports/request-full-report.xlsx";
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

router.get("/patient-feedback/report", SecureUI(), async (req, res, next) => {
  let date;
  if (req.query.timeperiod === "monthly")
    date = moment(new Date().toISOString().slice(0, 10)).subtract(1, "months").format("YYYY-MM-DD");
  if (req.query.timeperiod === "weekly")
    date = moment(new Date().toISOString().slice(0, 10)).subtract(7, "days").format("YYYY-MM-DD");

  let data = await RequestController.getReports(date);
  data = data.map(d => {
    return {
      "Patient Name": d.patient_name ? d.patient_name : "",
      "Requester Name": d.requester_name ? d.requester_name : "",
      "Requester Phone": d.requester_phone ? d.requester_phone : "",
      "Blood Group": d.blood_group && d.rh_factor ? d.blood_group + d.rh_factor : "",
      "Hospital Name": d.hospital ? d.hospital : "",
      "Managed From": d.request_managed_from ? d.request_managed_from : "",
      "Requested Date": d.requested_date ? d.requested_date.toISOString().slice(0, 10) : ""
    };
  });
  var xls = json2xls(data);
  var fileName = __dirname + "/../../public/reports/Patient Feedback Report.xlsx";
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
