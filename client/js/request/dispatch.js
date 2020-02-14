import AddModal from "./add.modal";
import UploadModal from "./upload.modal";
import OpenChoice from "./choice.comp";
import dispatchList from "./list.dispatch";

$(document).ready(async () => {
  let disList = new dispatchList({ target: ".dTable", id, group });
  let addModal = new AddModal({ target: "#mdlRequestAdd", name: "RequestAdd" });
  let uploadModal = new UploadModal({ target: "#mdlFileUpload" });
  let openChoices = new OpenChoice({ target: "#mdlDonorChoice", id });

  // addModal.on("request-added", (e, data) => {
  //   openChoices.open();
  //   // window.location.href = `/requests/edit/${data._id}`;
  // });

  // openChoices.on("select-org", (e, reqId) => {
  //   window.location.href = `/requests/edit/${reqId}`;
  // });

  // openChoices.on("select-donors", (e, reqId) => {
  //   window.location.href = `/requests/dispatch/${reqId}`;
  // });

  // $("#btnDelete").on("click", async e => {
  //   let isConfirm = await swal.fire({
  //     title: "Are you sure?",
  //     text: "You are delete a Blood Request.",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes",
  //     cancelButtonText: "No"
  //   });

  //   try {
  //     if (isConfirm.value) {
  //       await Service.remove(requestId);
  //       window.location.href = "/requests";
  //     }
  //   } catch (e) {
  //     console.log(e.message);
  //   }
  // });
});
