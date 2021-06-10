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
    let name = $(e.currentTarget).val();
    if (name.length < 1) {
      clearFilter();
    }
    $("#nameFilter").text(name);
    multipleFilter();
  });

  $("#filterByPhone").keyup(e => {
    let phone = $(e.currentTarget).val();
    if (phone.length < 1) {
      clearFilter();
    }
    $("#phoneFilter").text(phone);
    multipleFilter();
  });

  $("#filterByDate").change(e => {
    let date = $(e.currentTarget).val();
    if (date.length < 1) {
      clearFilter();
    }
    $("#dateFilter").text(date);
    multipleFilter();
  });

  $("#filterByStatus").change(e => {
    let status = $(e.currentTarget).val();
    if (status.length < 1) {
      clearFilter();
    }
    $("#statusFilter").text(status);
    multipleFilter();
  });

  $("#filterByGroup").change(e => {
    let group = $(e.currentTarget).val();
    if (group.length < 1) {
      clearFilter();
    }
    $("#groupFilter").text(group);
    multipleFilter();
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

  const multipleFilter = () => {
    let name = $("#nameFilter").text();
    let phone = $("#phoneFilter").text();
    let status = $("#statusFilter").text();
    let group = $("#groupFilter").text();
    let date = $("#dateFilter").text();
    rt.load(
      `/api/v1/requests?name=${encodeURIComponent(name)}&&requester_phone=${encodeURIComponent(
        phone
      )}&&status=${encodeURIComponent(status)}&&group=${encodeURIComponent(
        group
      )}&&date=${encodeURIComponent(date)}`
    );
  };
});
