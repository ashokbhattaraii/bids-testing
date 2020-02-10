import UserEdit from "./edit.comp";
// import UserAdd from "./add.comp";

$(document).ready(function() {
  let ut = new UserEdit({ target: "#frmUser" });
  ut.loadData(userId);
});
