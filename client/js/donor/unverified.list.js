import config from "../config";
import { TablePanel, Notify } from "rumsan-ui";
import Service from "./service";

class UnverifiedDonorTable extends TablePanel {
  constructor(cfg) {
    if (isHotline) {
      cfg.url = `${config.apiPath}/pledges`;
    } else {
      cfg.url = `${config.apiPath}/donors/unverified`;
    }

    super(cfg);
    this.registerEvents("delete-unverified-donor", "verify-donor-status", "upload-excel-file");
    this.render();

    this.on("delete-unverified-donor", (d, e) => {
      this.removeUnverifiedDonor(e);
    });

    this.on("verify-donor-status", (e, d) => {
      this.verifyDonor(d.id);
    });

    this.on("upload-excel-file", (d, e) => {
      this.uploadExcelFile();
    });

    let me = this;
  }

  setColumns() {
    return [
      {
        data: "name"
      },
      {
        data: "phone"
      },
      {
        data: "gender"
      },
      {
        data: null,
        render: d => {
          return d.address ? d.address : "";
        }
      },
      {
        data: null,
        render: d => {
          return d.blood_group ? d.blood_group : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          if (d.is_verified)
            return `<input type="checkbox" checked onclick="$('#unverifiedDonorTable').trigger('verify-donor-status',{ id:'${d._id}'})" />`;
          else
            return `<input type="checkbox" onclick="$('#unverifiedDonorTable').trigger('verify-donor-status',{ id:'${d._id}'})" />`;
        }
      },
      {
        data: null,
        render: d => {
          if (d.agree_to_donate == "yes") {
            d.agree_to_donate = "Yes";
          } else if (d.agree_to_donate == "no") {
            d.agree_to_donate = "No";
          }
          return d.agree_to_donate ? d.agree_to_donate : "N/A";
        }
      },
      {
        data: null,
        class: "text-center",
        render: (d, type, full, meta) => {
          return `<a onclick="$('#mdlUnverifiedDonorAdd').trigger('open-edit-modal','${d._id}')" title='Edit' class= 'text-right'>
          <i class='fa fa-edit'></i></a>&nbsp;&nbsp;
          <a onclick="$('#unverifiedDonorTable').trigger('delete-unverified-donor','${d._id}')" title='Delete' class= 'text-right'>
          <i class='fa fa-trash'></i></a>&nbsp;&nbsp;`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  async uploadExcelFile() {
    try {
      $("#spin-loader").removeAttr("style");
      $("#upload-excel-file").attr("style", "display:none;");
      let excel_file = $("#excelFile").val();
      if (!excel_file) return Notify.error("Please select an excel file to upload.");
      let formData = new FormData();
      formData.append("file", $("form input[type=file]")[0].files[0]);
      let me = this;

      $.ajax({
        type: "POST",
        url: "/api/v1/donors/unverified/upload",
        data: formData,
        processData: false,
        contentType: false,
        async: true,
        success: function (d) {
          const report = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(d));
          const a = document.getElementById("uploadedReport");
          a.href = "data:" + report;
          a.download = "data.txt";
          a.innerHTML = "download .txt file of json";
          a.click();
          $("input[type=file]").val("");
          $("#mdlUnverifiedExcelFileUpload").modal("hide");
          Notify.show("Upload Successful");
          me.reload();
        }
      });
    } catch (e) {
      Notify.error("Something went wrong, try another file.");
      console.log("ERR:", e);
    }
  }

  async removeUnverifiedDonor(id) {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    try {
      if (isConfirm.value) {
        let resData = await Service.deleteUnverifiedDonor(id);
        if (!resData) return;
        this.reload();
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  async verifyDonor(id) {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "Is the Donor Legit??",
      type: "warning",
      showCancelButton: true
    });

    try {
      if (isConfirm.value) {
        let resData = await Service.verifyDonor(id);
        if (!resData) return;
        this.reload();
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default UnverifiedDonorTable;
