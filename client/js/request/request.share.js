import {
  RequestDataLoad,
  RequestAddDonor,
  AdditionalDonorList,
  RequestEditDonor
} from "./request.dataLoad";

$(document).ready(function () {
  let reqLink = new RequestDataLoad({
    target: "#frmSharedlink",
    requestId,
    created_for
  });

  let addDonor = new RequestAddDonor({
    target: "#mdlAdditionalDonor",
    requestId,
    created_for
  });

  let additionalDonorList = new AdditionalDonorList({
    target: ".additionalDonorTable",
    requestId,
    created_for
  });

  let editDonor = new RequestEditDonor({
    target: "#mdlAdditionalDonorEdit",
    requestId,
    created_for
  });

  addDonor.on("donor-added", (d, e) => {
    additionalDonorList.reload();
  });

  editDonor.on("donor-edited", (d, e) => {
    additionalDonorList.reload();
  });

  additionalDonorList.on("edit-link-modal", (d, e) => {
    editDonor.open();
    editDonor.loadDonorData(e);
  });

  $("#btnAddDonor").on("click", () => {
    addDonor.open();
  });
});
