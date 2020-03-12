import DonorTable from "./list.panel";

$(document).ready(function() {
  let list = new DonorTable({ target: "#tblDonor" });

  $("#filterByName").keyup(e => {
    resetFilterFields("filterByName");
    let name = $(e.currentTarget).val();
    $("#txtFilter").text("(Fitered by name: " + name + ")");
    if (name.length < 1) {
      clearFilter();
    }
    list.load(`/api/v1/donors?name=${encodeURIComponent(name)}`);
  });

  $("#filterByPhone").keyup(e => {
    resetFilterFields("filterByPhone");
    let phone = $(e.currentTarget).val();
    $("#txtFilter").text("(Fitered by Phone: " + phone + ")");
    if (phone.length < 1) {
      clearFilter();
    }
    list.load(`/api/v1/donors?phone=${encodeURIComponent(phone)}`);
  });

  $("#filterByAddress").keyup(e => {
    resetFilterFields("filterByAddress");
    let address = $(e.currentTarget).val();
    $("#txtFilter").text("(Fitered by address: " + address + ")");
    if (address.length < 1) {
      clearFilter();
    }
    list.load(`/api/v1/donors?address=${encodeURIComponent(address)}`);
  });

  $("#filterByGroup").change(e => {
    resetFilterFields("filterByGroup");
    let value = $(e.currentTarget).val();
    if (value.length < 1) clearFilter();
    if (value.length > 0) {
      $("#txtFilter").text(`(Fitered by Blood Group: ${value})`);
      list.load(`/api/v1/donors?group=${encodeURIComponent(value)}`);
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
    list.load(`/api/v1/donors`);
    $("#clearFilter").hide();
  };

  const filter = (name, value) => {
    if (value.length < 1) clearFilter();
    if (value.length > 2) {
      $("#txtFilter").text(`(Fitered by ${name}: ${value})`);
      list.load(`/api/v1/donors?${name}=${encodeURIComponent(value)}`);
    }
  };
});
