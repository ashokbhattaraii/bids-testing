import RequestTable from "./table.comp";
import AddModal from "./add.modal";
import UploadModal from "./upload.modal";

//DropZone
Dropzone.autoDiscover = false;

$(document).ready(function() {
  let rt = new RequestTable({ target: "#tblRequest" });
  let addModal = new AddModal({ target: "#mdlRequestAdd" });
  let uploadModal = new UploadModal({ target: "#mdlFileUpload" });

  $("#btnRequestAdd").on("click", () => {
    addModal.open();
  });

  addModal.on("request-added", (e, data) => {
    uploadModal.open(data._id);
  });

  uploadModal.on("open-request", (e, reqId) => {
    window.location.href = `/requests/edit/${reqId}`;
  });

  uploadModal.on("select-donors", (e, reqId) => {
    window.location.href = `/requests/dispatch/${reqId}`;
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
      rt.table.load(`/api/v1/requests?group=${encodeURIComponent(value)}`);
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
    rt.table.load(`/api/v1/requests`);
    $("#clearFilter").hide();
  };

  const filter = (name, value) => {
    if (value.length < 1) clearFilter();
    if (value.length > 2) {
      $("#txtFilter").text(`(Fitered by ${name}: ${value})`);
      rt.table.load(`/api/v1/requests?${name}=${encodeURIComponent(value)}`);
    }
  };
});
