import OrgTable from "./list.panel";

$(document).ready(function() {
  let list = new OrgTable({ target: "#tblhospital", name: "hospital" });
  let bloodBankList = new OrgTable({ target: "#tblbloodbank", name: "bloodbank" });
});
