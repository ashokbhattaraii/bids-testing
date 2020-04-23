import EmployeeTable from "./list.employee";

$(document).ready(function () {
  let employeeList = new EmployeeTable({ target: "#employeeList", organizationId });
});
