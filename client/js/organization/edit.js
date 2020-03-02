import OrgEdit from "./edit.panel";

$(document).ready(function() {
  let editOrganization = new OrgEdit({ target: "#frmorgEdit", name: "orgEdit", organizationId });
});
