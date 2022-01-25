import dispatchList from "./list.donor";
import OrganizationTable from "./list.organization";
import DonorHistoryAdd from "./add.donorHistory";

$(document).ready(async () => {
  let disList = new dispatchList({ target: ".dTable", id, group });
  let orgList = new OrganizationTable({ target: ".oTable", id, group });
  let donorHistory = new DonorHistoryAdd({
    target: "#frmDonorHistoryAdd",
    name: "DonorHistoryAdd",
    id
  });

  donorHistory.on("rating-added", () => {
    window.location.href = `/requests/dispatch/${id}`;
  });

  $("#resetDonor").on("click", () => {
    $(".dTable input[type=checkbox]").prop("checked", false);
    localStorage.removeItem("donor" + id);
  });

  $("#resetOrg").on("click", () => {
    $(".oTable input[type=checkbox]").prop("checked", false);
    localStorage.removeItem("organization" + id);
  });

  disList.on("add-organization", () => {
    window.location.href = `/requests/organization/${id}`;
  });

  orgList.on("add-donor", () => {
    window.location.href = `/requests/dispatch/${id}`;
  });

  $("#donor_status").on("change", function () {
    let value = $(this).val();
    donorHistory.toggleStatusNote(value);
  });

  const resetFilter = field => {
    $("#txtFilter").text("");
    if (field != "filterByAddress") $("#filterByAddress").val("");
    if (field != "filterByName") $("#filterByName").val("");
    if (field != "filterByGender") $("#filterByGender").val("");
  };

  const clearFilter = () => {
    resetFilter();
    disList.load(`/api/v1/requests/dispatch/${id}?group=${encodeURIComponent(group)}`);
    $("#clearFilter").hide();
  };

  $("#filterByAddress").keyup(e => {
    resetFilter("filterByAddress");
    let address = $(e.currentTarget).val();
    $("#txtFilter").text("(Fitered by address: " + address + ")");
    if (address.length < 1) {
      clearFilter();
    }
    disList.load(
      `/api/v1/requests/dispatch/${id} ?group=${encodeURIComponent(
        group
      )}&address=${encodeURIComponent(address)}`
    );
  });

  $("#filterByName").keyup(e => {
    resetFilter("filterByName");
    let name = $(e.currentTarget).val();

    $("#txtFilter").text("(Fitered by name: " + name + ")");
    if (name.length < 1) {
      clearFilter();
    }
    disList.load(
      `/api/v1/requests/dispatch/${id}?name=${encodeURIComponent(name)}&&group=${encodeURIComponent(
        group
      )}`
    );
  });

  $("#filterOrgByAddress").keyup(e => {
    resetFilter("filterOrgByAddress");
    let address = $(e.currentTarget).val();
    $("#txtFilter").text("(Fitered by address: " + address + ")");
    if (address.length < 1) {
      clearFilter();
    }
    orgList.load(`/api/v1/requests/organization/${id}?address=${encodeURIComponent(address)}`);
  });

  $("#filterOrgByName").keyup(e => {
    resetFilter("filterOrgByName");
    let name = $(e.currentTarget).val();
    $("#txtFilter").text("(Fitered by name: " + name + ")");
    if (name.length < 1) {
      clearFilter();
    }
    orgList.load(`/api/v1/requests/organization/${id}?name=${encodeURIComponent(name)}`);
  });

  $("#filterByGender").change(e => {
    resetFilter("filterByGender");
    let gender = $(e.currentTarget).val();
    if (gender.length < 1) clearFilter();
    $("#txtFilter").text("(Fitered by Gender: " + gender + ")");
    disList.load(
      `/api/v1/requests/dispatch/${id} ?group=${encodeURIComponent(
        group
      )}&gender=${encodeURIComponent(gender)}`
    );
  });

  $('#btnCancel').on('click', () => {
    window.location.replace(`/requests/edit/${id}`);
  })

  $('#btnModalClose').on('click',() =>{
    window.location.replace('/requests');
  })
});
