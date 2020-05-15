import UnverifiedListTable from "./unverified.list";

$(document).ready(function () {
  let unverifiedlist = new UnverifiedListTable({ target: "#unverifiedDonorTable" });

  $("#filterPhone").keyup(e => {
    page.resetFilter("filterPhone");
    let phone = $(e).val();
    $("#txtFilter").text("(Fitered by phone: " + phone + ")");
    if (phone.length < 1) {
      page.clearFilter();
    }
    unverifiedlist.load("/api/v1/donors/unverified?phone=" + encodeURIComponent(phone));
  });

  $("#filterName").keyup(e => {
    page.resetFilter("filterName");
    let name = $(e).val();
    $("#txtFilter").text("(Fitered by name: " + name + ")");
    if (name.length < 1) {
      page.clearFilter();
    }
    unverifiedlist.load("/api/v1/donors/unverified?name=" + encodeURIComponent(name));
  });

  $("#filterAddress").keyup(e => {
    page.resetFilter("filterAddress");
    let address = $(e).val();
    $("#txtFilter").text("(Fitered by address: " + address + ")");
    if (address.length < 1) {
      page.clearFilter();
    }
    unverifiedlist.load("/api/v1/donors/unverified?address=" + encodeURIComponent(address));
  });

  $("#filterSource").keyup(e => {
    page.resetFilter("filterSource");
    let source = $(e).val();
    $("#txtFilter").text("(Fitered by source: " + source + ")");
    if (source.length < 1) {
      page.clearFilter();
    }
    unverifiedlist.load("/api/v1/donors/unverified?source=" + encodeURIComponent(source));
  });

  $("#filterGroup").keyup(e => {
    page.resetFilter("filterGroup");
    let group = $(e).val();
    $("#txtFilter").text("(Fitered by group: " + group + ")");
    if (group.length < 1) {
      page.clearFilter();
    }
    unverifiedlist.load("/api/v1/donors/unverified?group=" + encodeURIComponent(group));
  });

  const page = {
    resetFilter: field => {
      $("#txtFilter").text("");
      if (field != "filterGroup") $("#filterGroup").val("");
      if (field != "filterName") $("#filterName").val("");
      if (field != "filterPhone") $("#filterPhone").val("");
    },
    clearFilter: group => {
      page.resetFilter();
      dtTable.ajax.url(`/api/v1/donors/unverified`).load();
      $("#clearFilter").hide();
    }
  };
});
