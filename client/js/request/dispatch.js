import dispatchList from "./list.dispatch";

$(document).ready(async () => {
  let disList = new dispatchList({ target: ".dTable", id, group });

  const page = {
    resetFilter: field => {
      $("#txtFilter").text("");
      if (field != "filterGroup") $("#filterGroup").val("");
      if (field != "filterName") $("#filterName").val("");
      if (field != "filterPhone") $("#filterPhone").val("");
    },
    clearFilter: () => {
      page.resetFilter();
      rTable.ajax
        .url("/api/v1/requests/dispatch/" + id + "?" + "group=" + encodeURIComponent(group))
        .load();
      $("#clearFilter").hide();
    },

    filterByAddress: e => {
      page.resetFilter("filterAddress");
      let address = $(e).val();
      $("#txtFilter").text("(Fitered by address: " + address + ")");
      if (address.length < 1) {
        page.clearFilter();
      }
      rTable.ajax
        .url(
          "/api/v1/requests/dispatch/" +
            id +
            "?" +
            "group=" +
            encodeURIComponent(group) +
            "&address=" +
            encodeURIComponent(address)
        )
        .load();
    },
    filterByName: e => {
      page.resetFilter("filterName");
      let name = $(e).val();
      $("#txtFilter").text("(Fitered by address: " + name + ")");
      if (name.length < 1) {
        page.clearFilter();
      }
      rTable.ajax
        .url(
          "/api/v1/requests/dispatch/" +
            id +
            "?" +
            "group=" +
            encodeURIComponent(group) +
            "&name=" +
            encodeURIComponent(name)
        )
        .load();
    }
  };
});
