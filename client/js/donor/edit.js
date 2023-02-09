import DonorEdit from "./edit.panel";
import { Notify } from "rumsan-ui";

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  let edit = new DonorEdit({ target: "#frmDonorList", name: "DonorEdit", donorId, from: urlParams.get('from')});
});
