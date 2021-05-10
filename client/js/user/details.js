import UserEdit from "./edit.comp";
import RolePanel from "./role.panel";

$(document).ready(function () {
  let ut = new UserEdit({ target: "#UserDetailsPanel", user_id });
  let rolePanel = new RolePanel({ target: "#UserRolePanel", tblTarget: "#UserRoleTable" });
  ut.on("data-load", (e, d) => rolePanel.setUserData(d));

  // rolePanel.on("data-change", () => ut.loadData(userId));
});
