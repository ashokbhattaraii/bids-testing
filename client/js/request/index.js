import RequestTable from "./table.comp";
import AddModal from "./add.modal";
import OpenChoice from "./choice.comp";
import FileUpload from "./upload.modal";

//DropZone
Dropzone.autoDiscover = false;

$(document).ready(function () {
  let rt = new RequestTable({ target: "#tblRequest" });
  let addModal = new AddModal({ target: "#mdlRequestAdd", name: "RequestAdd" });
  let openChoices = new OpenChoice({ target: "#mdlDonorChoice" });
  let FUpload = new FileUpload({ target: "#mdlFileUpload" });

  $("#btnRequestAdd").on("click", () => {
    addModal.open();
  });

  addModal.on("request-added", (e, data) => {
    window.location.href = `/requests/organization/${data._id}`;
  });

  rt.on("open-choices", (e, data) => {
    let result = rt.checkRequestType(data);
    result.then(obj => {
      if (obj.length > 0) {
        if (obj[0].type === "donor") {
          window.location.href = `/requests/dispatch/${data}`;
        } else if (obj[0].type === "organization") {
          window.location.href = `/requests/organization/${data}`;
        }
      } else {
        window.location.href = `/requests/dispatch/${data}`;
      }
    });
  });

  openChoices.on("select-org", (e, val) => {
    val = val.split(",");
    openChoices.saveRequestType(val[1]);
    window.location.href = `/requests/organization/${val[0]}`;
  });

  openChoices.on("select-donors", (e, val) => {
    val = val.split(",");
    openChoices.saveRequestType(val[1]);
    window.location.href = `/requests/dispatch/${val[0]}`;
  });

  $(".req-products").on("click", function () {
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

  $("#filterByDate").change(e => {
    resetFilterFields("filterByDate");
    let value = $(e.currentTarget).val();
    if (value.length < 1) clearFilter();
    if (value.length > 0) {
      if (value === "all") {
        $("#txtFilter").text(`(Fitered by Date: ${value})`);
        rt.load(`/api/v1/requests`);
      } else if (value === "today") {
        $("#txtFilter").text(`(Fitered by Date: ${value})`);
        rt.load(`/api/v1/requests/today/`);
      }
    }
  });

  $("#filterByStatus").change(e => {
    resetFilterFields("filterByStatus");
    let value = $(e.currentTarget).val();
    if (value.length < 1) clearFilter();
    if (value.length > 0) {
      $("#txtFilter").text(`(Fitered by Status: ${value})`);
      rt.load(`/api/v1/requests?status=${encodeURIComponent(value)}`);
    }
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
    if (field != "filterByDate") $("#filterByDate").val("");
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
