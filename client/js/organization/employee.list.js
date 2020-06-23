import EmployeeTable from "./list.employee";
import AddEmployee from "./add.employee";
import { Notify } from "rumsan-ui";

$(document).ready(function () {
  let employeeList = new EmployeeTable({ target: "#employeeList", organizationId });
  let employeeAdd = new AddEmployee({
    target: "#mdlAddEmployee",
    name: "AddEmployee",
    organizationId
  });

  employeeAdd.on("employee-added", (d, e) => {
    employeeAdd.form.clear();
    employeeAdd.close();
    employeeList.reload();
  });
  employeeAdd.on("employee-removed", (d, e) => {
    Notify.show("Employee Removed Successfully");
    employeeList.reload();
  });

  $(document).on("click", "#deleteEmployee", function () {
    var userId = $(this).val()
    employeeAdd.removeEmp(userId);
  })
});
