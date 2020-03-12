import Service from "./service";
import UserEdit from "./edit.comp";
import AddModal from "./add.modal";
import dispatchList from "./list.donor";
import OrganizationTable from "./list.organization";
import RequestTable from "./table.comp";

$(document).ready(async () => {
  let editUser = new UserEdit({
    target: "#frmRequestEdit",
    name: "RequestEdit",
    requestId,
    requestType
  });

  let disList = new dispatchList({ target: ".dTable", requestId });
  let orgList = new OrganizationTable({ target: ".oTable", requestId });
  let rt = new RequestTable({ target: "#tblRequest" });

  editUser.on("remove-req-donor", (d, e) => {
    let g = e.split(",");
    editUser.rmDonor(g[0], g[1], g[2]);
    disList.removeDonorLocal(requestId, g[1]);
  });

  editUser.on("remove-req-organization", (d, e) => {
    let g = e.split(",");
    editUser.rmOrganization(g[0], g[1], g[2]);
    orgList.removeOrganizationLocal(requestId, g[1]);
  });

  let addModal = new AddModal({ target: "#mdlRequestAdd", name: "RequestAdd" });

  $(".req-products").on("click", function() {
    let is_checked = $(this).is(":checked");
    let blood_type = $(this).data("type");
    addModal.toggleQuantity(is_checked, blood_type);
  });

  $("#btnDelete").on("click", async e => {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You are delete a Blood Request.",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    });

    try {
      if (isConfirm.value) {
        await Service.remove(requestId);
        window.location.href = "/requests";
      }
    } catch (e) {
      console.log(e.message);
    }
  });
});
