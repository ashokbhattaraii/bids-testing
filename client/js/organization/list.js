import OrgTable from "./list.panel";

$(document).ready(function() {
  let list = new OrgTable({ target: "#tblHospital", name: "hospital" });
  let bloodBankList = new OrgTable({ target: "#tblBloodBank", name: "bloodbank" });
});
