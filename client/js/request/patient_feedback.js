import PatientFeedbackTable from "./request.patient_feedback";

$(document).ready(function () {
  let rt = new PatientFeedbackTable({ target: "#tblPatientFeedbackRequest" });

  $("#filterByName").keyup(e => {
    resetFilterFields("filterByName");
    filter("name", $(e.currentTarget).val());
  });

  rt.on("table-load-by-date", (e, d) => {
    let from_date = $("#from_date").val();
    let to_date = $("#to_date").val();
    if (from_date && to_date)
      rt.load(`/api/v1/requests/patient-feedback?from_date='${from_date}'&&to_date='${to_date}'`);
  });

  $("#filterByPhone").keyup(e => {
    resetFilterFields("filterByPhone");
    filter("requester_phone", $(e.currentTarget).val());
  });

  $("#filterByStatus").change(e => {
    resetFilterFields("filterByStatus");
    let value = $(e.currentTarget).val();
    if (value.length < 1) clearFilter();
    if (value.length > 0) {
      $("#txtFilter").text(`(Fitered by Status: ${value})`);
      rt.load(`/api/v1/requests/patient-feedback?status=${encodeURIComponent(value)}`);
    }
  });

  $("#filterByGroup").change(e => {
    resetFilterFields("filterByGroup");
    let value = $(e.currentTarget).val();
    if (value.length < 1) clearFilter();
    if (value.length > 0) {
      $("#txtFilter").text(`(Fitered by Blood Group: ${value})`);
      rt.load(`/api/v1/requests/patient-feedback?group=${encodeURIComponent(value)}`);
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
    rt.load(`/api/v1/requests`);
    $("#clearFilter").hide();
  };

  const filter = (name, value) => {
    if (value.length < 1) clearFilter();
    if (value.length > 2) {
      $("#txtFilter").text(`(Fitered by ${name}: ${value})`);
      rt.load(`/api/v1/requests/patient-feedback?${name}=${encodeURIComponent(value)}`);
    }
  };
});
