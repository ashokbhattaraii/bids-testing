import RequestTable from "./table.comp";
import RequestAdd from "./add.comp";

$(document).ready(function() {
  let rt = new RequestTable({ target: "#tblRequest" });
  let addComp = new RequestAdd({ target: "#mdlRequestAdd" });

  $("#btnRequestAdd").on("click", () => {
    addComp.open();
  });

  addComp.on("request-added", (e, data) => {
    window.location.href = "/requests/dispatch/" + data._id;
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
