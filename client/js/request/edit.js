import Service from "./service";
import UserEdit from "./edit.comp";
import AddModal from "./add.modal";
import dispatchList from "./list.dispatch";

$(document).ready(async () => {
  let editUser = new UserEdit({ target: "#frmRequestEdit", name: "RequestEdit", requestId });
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
