import Requestlist from "./list.requestLink";
import RequestLink from "./request.link";

$(document).ready(function () {
  let reqLinkList = new Requestlist({ target: "#linksTable", reqId });
  let openRequestUrlAdd = new RequestLink({
    target: "#mdlRequestLink",
    name: "RequestLink",
    reqId
  });

  reqLinkList.on("open-link-modal", () => {
    openRequestUrlAdd.open();
    openRequestUrlAdd.loadUserList();
  });

  reqLinkList.on("edit-link-modal", (d, e) => {
    openRequestUrlAdd.openEditModal(e);
    openRequestUrlAdd.loadUserList();
  });

  openRequestUrlAdd.on("request-link-added", () => {
    reqLinkList.reload();
  });
});
