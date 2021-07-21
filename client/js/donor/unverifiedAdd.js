import UnverifiedDonorAdd from "./unverified.add";
import UnverifiedListTable from "./unverified.list";

$(document).ready(function () {
  let add = new UnverifiedDonorAdd({
    target: "#mdlUnverifiedDonorAdd",
    name: "UnverifiedDonorAdd"
  });

  add.on("unverified-donor-added", (d, e) => {
    add.form.clear();
    add.close();
    unverifiedlist.reload();
  });

  let unverifiedlist = new UnverifiedListTable({ target: "#unverifiedDonorTable" });

  $("#clearFilter").on("click", () => {
    clearFilter();
  });

  $("#filterByName").keyup(e => {
    let name = $(e.currentTarget).val();
    $("#nameFilter").text("name: " + name);
    $("#filteredBy").show();
    $("#clearFilter").show();

    if (name.length < 1) {
      $("#nameFilter").text("");
    }
    multipleFilter();
  });

  $("#filterByPhone").keyup(e => {
    let phone = $(e.currentTarget).val();
    $("#phoneFilter").text("phone: " + phone);
    $("#filteredBy").show();
    $("#clearFilter").show();

    if (phone.length < 1) {
      $("#phoneFilter").text("");
    }
    multipleFilter();
  });

  $("#filterByAddress").keyup(e => {
    let address = $(e.currentTarget).val();
    $("#addressFilter").text("address: " + address);
    $("#filteredBy").show();
    $("#clearFilter").show();

    if (address.length < 1) {
      $("#addressFilter").text("");
    }
    multipleFilter();
  });

  $("#filterByGroup").change(e => {
    let group = $(e.currentTarget).val();

    if (group.length < 1) $("#groupFilter").text("");
    $("#filteredBy").show();
    $("#clearFilter").show();
    $("#groupFilter").text("blood group: " + group);
    multipleFilter();
  });

  $("#filterByVerification").change(e => {
    let is_verified = $(e.currentTarget).val();
    if (is_verified.length < 1) $("#verificationFilter").text("");
    $("#filteredBy").show();
    $("#clearFilter").show();
    $("#verificationFilter").text("Is Verified: " + is_verified);
    multipleFilter();
  });

  $("#filterByGender").change(e => {
    let gender = $(e.currentTarget).val();
    if (gender.length < 1) $("#genderFilter").text("");
    $("#genderFilter").text("gender: " + gender);
    $("#filteredBy").show();
    $("#clearFilter").show();
    multipleFilter();
  });

  $("#filterSource").keyup(e => {
    let source = $(e.currentTarget).val();
    $("#sourceFilter").text("source: " + source);
    $("#filteredBy").show();
    $("#clearFilter").show();
    if (source.length < 1) {
      $("#sourceFilter").text("");
    }
    multipleFilter();
  });

  $("#filterPage").keyup(e => {
    let page = $(e.currentTarget).val();
    $("#pageFilter").text("page: " + page);
    $("#filteredBy").show();
    $("#clearFilter").show();
    if (page.length < 1) {
      $("#pageFilter").text("");
    }
    multipleFilter();
  });

  const clearFilter = field => {
    $("#nameFilter").text("");
    $("#phoneFilter").text("");
    $("#addressFilter").text("");
    $("#genderFilter").text("");
    $("#groupFilter").text("");
    $("#sourceFilter").text("");
    $("#pageFilter").text("");
    $(".filterInputs input").val("");
    $(".filterInputs select").val("");
    if (isHotline) {
      unverifiedlist.load(`/api/v1/pledges`);
    } else {
      unverifiedlist.load(`/api/v1/donors/unverified`);
    }
    $("#clearFilter").hide();
    $("#filteredBy").hide();
  };

  const multipleFilter = () => {
    let name = $("#nameFilter").text() ? $("#nameFilter").text().split(": ")[1] : "";
    let phone = $("#phoneFilter").text() ? $("#phoneFilter").text().split(": ")[1] : "";
    let address = $("#addressFilter").text() ? $("#addressFilter").text().split(": ")[1] : "";
    let group = $("#groupFilter").text() ? $("#groupFilter").text().split(": ")[1] : "";
    let gender = $("#genderFilter").text() ? $("#genderFilter").text().split(": ")[1] : "";
    let source = $("#sourceFilter").text() ? $("#sourceFilter").text().split(": ")[1] : "";
    let page = $("#pageFilter").text() ? $("#pageFilter").text().split(": ")[1] : "";
    let verification = $("#verificationFilter").text()
      ? $("#verificationFilter").text().split(": ")[1]
      : "";
    unverifiedlist.load(
      `/api/v1/donors/unverified?name=${encodeURIComponent(name)}&&phone=${encodeURIComponent(
        phone
      )}&&address=${encodeURIComponent(address)}&&group=${encodeURIComponent(
        group
      )}&&gender=${encodeURIComponent(gender)}&&is_verified=${encodeURIComponent(
        verification
      )}&&source=${encodeURIComponent(source)}&&page=${encodeURIComponent(page)}`
    );
  };
});
