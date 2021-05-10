import OrgTable from "./list.panel";
import EmployeeTable from "./list.employee";

$(document).ready(function () {
  let list = new OrgTable({ target: "#tblhospital", name: "hospital" });
  let bloodBankList = new OrgTable({ target: "#tblbloodbank", name: "bloodbank" });
});
