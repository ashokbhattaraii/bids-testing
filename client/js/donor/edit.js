import DonorEdit from "./edit.panel";
import { Notify } from "rumsan-ui";

$(document).ready(function () {
  let edit = new DonorEdit({ target: "#frmDonorList", name: "DonorEdit", donorId });

  edit.on("donor-updated", (d, e) => {
    console.log("hello");
    Notify.show("Donor Data Updated Successfully");
    setTimeout(function () {
      window.location.href = "/donors";
    }, 2000);
  });
});
