import UserTable from "./table.comp";
import UserAdd from "./add.comp";

$(document).ready(function () {
  let ut = new UserTable({ target: "#user-table" });
  let userAdd = new UserAdd({ target: "#mdlUserAdd", name: "UserAdd" });

  $("#btnUserAdd").on("click", () => {
    userAdd.open();
  });

  userAdd.on("user-added", () => {
    ut.reload();
  });
});
