import Service from "./service";
import { Form } from "rs-utils";
const RSForm = Form($);

$(document).ready(async () => {
  let data = await Service.get(requestId);
  RSForm.set("#frmRequestEdit", data);

  $("#btnDelete").on("click", async e => {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You are delete a Blood Request.",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    });

    try {
      if (isConfirm.value) {
        await Service.remove(requestId);
        window.location.href = "/requests";
      }
    } catch (e) {
      console.log(e.message);
    }
  });
});
