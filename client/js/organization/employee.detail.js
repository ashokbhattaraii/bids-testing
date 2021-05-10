import EditEmployee from "./edit.employee";

$(document).ready(function () {
  let employeeEdit = new EditEmployee({ target: "#frmEditUser", name: "EditUser", emp_id });
});
