import { Component, DataTable } from "../core";
import Services from "./service";

class UserTable extends Component {
  constructor(cfg) {
    super(cfg);
    this.table = this.makeTable(cfg);
    this.events = ["change-user-status"];

    this.on("change-user-status", async (event, data) => {
      let checked = await this.changeUserStatus(data.userId, data.source.checked);
      data.source.checked = checked;
    });
  }

  makeTable(cfg) {
    return new DataTable({
      pageLength: 40,
      target: cfg.target,
      url: "/api/v1/requests",
      columns: [
        {
          data: null,
          render: function(data) {
            return `<a href="/requests/edit/${data._id}">${data.patient_name}</a>`;
          }
        },
        {
          data: "requester_phone"
        },
        {
          data: "hospital"
        },

        {
          data: null,
          render: d => {
            return d.blood_group ? `${d.blood_group}${d.rh_factor}` : "N/A";
          }
        },
        {
          data: null,
          render: data => {
            if (!data.createdAt) return "";
            else return moment(data.createdAt).format("YYYY-MM-DD");
          }
        },
        {
          data: null,
          class: "text-center",
          render: function(data, type, full, meta) {
            return `
                    <a href="/requests/dispatch/${data._id}" id="addDonors"  title='Add Donors'><i class='btn btn-primary btn-xs fa fa-plus user-icon'></i></a>

            <a  href="/requests/edit/${data._id}" id="editRequest" title='Edit Request'

            data><i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a>`;
          }
        }
      ]
    });
  }

  reload() {
    this.table.ajax.reload();
  }

  async changeUserStatus(user_id, isActive) {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You are changing status of the user.",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    });

    try {
      if (isConfirm.value) {
        await Services.changeStatus(user_id, isActive);
        return isActive;
      } else {
        return !isActive;
      }
    } catch (e) {
      console.log(e.message);
      return !isActive;
    }
  }
}

export default UserTable;
