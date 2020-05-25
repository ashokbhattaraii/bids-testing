import EmployeeTable from "./list.employee";
import AddEmployee from "./add.employee";

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
});
