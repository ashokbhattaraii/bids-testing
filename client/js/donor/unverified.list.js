import config from "../config";
import { TablePanel } from "rumsan-ui";
import Service from "./service";

class UnverifiedDonorTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/donors/unverified`;
    super(cfg);
    this.registerEvents("delete-unverified-donor", "change-donor-status");
    this.render();

    this.on("delete-unverified-donor", (d, e) => {
      this.removeUnverifiedDonor(e);
    });

    this.on("change-donor-status", (d, e) => {
      let id = e.split(",")[0];
      let status = e.split(",")[1];
      this.changeDonorStatus(id, status);
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
            return `<input type="checkbox" checked onclick="$('#unverifiedDonorTable').trigger('change-donor-status','${d._id},false')" />`;
          else
            return `<input type="checkbox" onclick="$('#unverifiedDonorTable').trigger('change-donor-status','${d._id},true')" />`;
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

  async changeDonorStatus(id, is_verified) {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You are changing status of the user.",
      type: "warning",
      showCancelButton: true
    });

    let data = { is_verified };

    if (isConfirm) {
      let resData = await Service.changeDonorStatus(id, data);
      if (!resData) return;
      this.reload();
    }
  }
}

export default UnverifiedDonorTable;
