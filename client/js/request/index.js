import RequestTable from "./table.comp";
import AddModal from "./add.modal";
import UploadModal from "./upload.modal";
import OpenChoice from "./choice.comp";

//DropZone
Dropzone.autoDiscover = false;

$(document).ready(function() {
  let rt = new RequestTable({ target: "#tblRequest" });
  let addModal = new AddModal({ target: "#mdlRequestAdd", name: "RequestAdd" });
  let uploadModal = new UploadModal({ target: "#mdlFileUpload" });
  let openChoices = new OpenChoice({ target: "#mdlDonorChoice" });

  $("#btnRequestAdd").on("click", () => {
    addModal.open();
  });

  addModal.on("request-added", (e, data) => {
    rt.reload();
    openChoices.openModal(data._id);
  });

  openChoices.on("select-org", (e, reqId) => {
    window.location.href = `/requests/edit/${reqId}`;
  });

  openChoices.on("select-donors", (e, reqId) => {
    window.location.href = `/requests/dispatch/${reqId}`;
  });

  $(".req-products").on("click", function() {
    let is_checked = $(this).is(":checked");
    let blood_type = $(this).data("type");
    addModal.toggleQuantity(is_checked, blood_type);
  });

  $("#filterByName").keyup(e => {
    resetFilterFields("filterByName");
    filter("name", $(e.currentTarget).val());
  });

  $("#filterByPhone").keyup(e => {
    resetFilterFields("filterByPhone");
    filter("requester_phone", $(e.currentTarget).val());
  });

  $("#filterByAddress").keyup(e => {
    resetFilterFields("filterByAddress");
    filter("address", $(e.currentTarget).val());
  });

  $("#filterByGroup").change(e => {
    resetFilterFields("filterByGroup");
    let value = $(e.currentTarget).val();
    if (value.length < 1) clearFilter();
    if (value.length > 0) {
      $("#txtFilter").text(`(Fitered by Blood Group: ${value})`);
      rt.load(`/api/v1/requests?group=${encodeURIComponent(value)}`);
    }
  });

  const resetFilterFields = field => {
    if (field != "filterByGroup") $("#filterByGroup").val("");
    if (field != "filterByName") $("#filterByName").val("");
    if (field != "filterByPhone") $("#filterByPhone").val("");
    if (field != "filterByGroup") $("#filterByGroup").val("");
  };

  const clearFilter = field => {
    $("#txtFilter").text("");
    rt.load(`/api/v1/requests`);
    $("#clearFilter").hide();
  };

  const filter = (name, value) => {
    if (value.length < 1) clearFilter();
    if (value.length > 2) {
      $("#txtFilter").text(`(Fitered by ${name}: ${value})`);
      rt.load(`/api/v1/requests?${name}=${encodeURIComponent(value)}`);
    }
  };
});
