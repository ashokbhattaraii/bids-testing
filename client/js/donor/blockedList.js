import DonorTable from "./blockedList.panel";

$(document).ready(function () {
  let list = new DonorTable({ target: "#tblDonor" });

  $("#filterByName").keyup(e => {
    let name = $(e.currentTarget).val();
    $("#nameFilter").text(name);

    if (name.length < 1) {
      clearFilter();
    }
    multipleFilter();
  });

  $("#filterByPhone").keyup(e => {
    let phone = $(e.currentTarget).val();
    $("#phoneFilter").text(phone);

    if (phone.length < 1) {
      clearFilter();
    }
    multipleFilter();
  });

  $("#filterByAddress").keyup(e => {
    let address = $(e.currentTarget).val();
    $("#addressFilter").text(address);

    if (address.length < 1) {
      clearFilter();
    }
    multipleFilter();
  });

  $("#filterByGroup").change(e => {
    let group = $(e.currentTarget).val();

    if (group.length < 1) clearFilter();

    $("#groupFilter").text(group);
    multipleFilter();
  });

  $("#filterByGender").change(e => {
    let gender = $(e.currentTarget).val();
    if (gender.length < 1) clearFilter();
    $("#genderFilter").text(gender);

    multipleFilter();
  });

  const clearFilter = field => {
    $("#txtFilter").text("");
    // list.load(`/api/v1/donors`);
    multipleFilter();
    $("#clearFilter").hide();
  };

  const multipleFilter = () => {
    let name = $("#nameFilter").text();
    let phone = $("#phoneFilter").text();
    let address = $("#addressFilter").text();
    let group = $("#groupFilter").text();
    let gender = $("#genderFilter").text();
    list.load(
      `/api/v1/donors?is_active=${encodeURIComponent(false)}&&name=${encodeURIComponent(name)}&&phone=${encodeURIComponent(
        phone
      )}&&address=${encodeURIComponent(address)}&&group=${encodeURIComponent(
        group
      )}&&gender=${encodeURIComponent(gender)}`
    );
  };
});
