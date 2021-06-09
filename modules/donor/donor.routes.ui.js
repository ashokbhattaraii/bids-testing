const router = require("express").Router();
const { SecureUI } = require("../../utils/secure");
const DonorController = require("./donor.controller");
const donation = require("../../donation");
var json2xls = require("json2xls");
var fs = require("fs");
var moment = require("moment");

router.get("/", SecureUI(), async (req, res, next) => {
  res.render("donor/index", {
    title: "Donor List"
  });
});

router.get("/edit/:id", SecureUI(), async (req, res, next) => {
  let donor = await donation.getSpecificDonor(req.params.id);
  res.render("donor/edit", {
    title: "Donor Edit",
    donor
  });
});

router.get("/unverified", SecureUI(), async (req, res, next) => {
  const isHotline = req.query.hotline;
  let title = "Unverified Donor List";
  if (isHotline) {
    title = "Unverified Hotline Donor List"
  }
  res.render("donor/unverifiedList", {
    title,
    isHotline
  });
});


router.get("/unverified/daily", SecureUI(), async (req, res, next) => {
  let today = new Date().toISOString().slice(0, 10);
  let data = await DonorController.getReports(today);
  data = data.map(d => {
    let gender = d.gender == "F" ? "Female" : "Male";
    return {
      Name: d.name ? d.name : "",
      Phone: d.phone ? d.phone : "",
      Address: d.address ? d.address : "",
      Email: d.email ? d.email : "",
      "Date of Birth": d.dob ? moment(d.dob).format("LL") : "",
      Weight: d.weight ? d.weight : "",
      Gender: gender,
      "Blood Group": d.blood_group ? d.blood_group : "",
      Source: d.source.name ? d.source.name : "",
      "Agree to Donate?": d.agree_to_donate,
      Notes: d.notes ? d.notes : "",
      "Verified Date": d.updated_at ? d.updated_at.toISOString().slice(0, 10) : ""
    };
  });
  var xls = json2xls(data);
  var fileName = __dirname + "/../../public/reports/Daily Report.xlsx";
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

router.get("/unverified/verifiedOnly", SecureUI(), async (req, res, next) => {
  let data = await DonorController.getReports();
  data = data.map(d => {
    let gender = d.gender == "F" ? "Female" : "Male";
    return {
      Name: d.name ? d.name : "",
      Phone: d.phone ? d.phone : "",
      Address: d.address ? d.address : "",
      Email: d.email ? d.email : "",
      "Date of Birth": d.dob ? moment(d.dob).format("LL") : "",
      Weight: d.weight ? d.weight : "",
      Gender: gender,
      "Agree to Donate?": d.agree_to_donate,
      "Blood Group": d.blood_group ? d.blood_group : "",
      Source: d.source.name ? d.source.name : "",
      Notes: d.notes ? d.notes : "",
      "Verified Date": d.updated_at ? d.updated_at.toISOString().slice(0, 10) : ""
    };
  });
  var xls = json2xls(data);
  var fileName = __dirname + "/../../public/reports/Verified Report.xlsx";
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

router.get("/unverified/custom", SecureUI(), async (req, res, next) => {
  let startDate = new Date(req.query.startDate).toISOString().slice(0, 10);
  let endDate = new Date(req.query.endDate).toISOString().slice(0, 10);
  DonorController.getReports(startDate, endDate).then(d => console.log(d));
});

module.exports = router;
