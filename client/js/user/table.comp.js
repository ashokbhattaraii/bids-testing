import config from "../config";
import { Component, TablePanel } from "rumsan-ui";
import Services from "./service";

class UserTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/users`;
    super(cfg);
    this.render();
    this.registerEvents("change-user-status");

    this.on("change-user-status", async (event, data) => {
      let checked = await this.changeUserStatus(data.userId, data.source.checked);
      data.source.checked = checked;
    });
  }

  setColumns() {
    return [
      { data: "full_name" },
      {
        data: null,
        render: d => {
          let phone = d.comms.find(e => {
            return e.type == "phone";
          });
          return phone ? phone.address : "";
        }
      },
      {
        data: null,
        render: d => {
          let email = d.comms.find(e => {
            return e.type == "email";
          });
          return email ? email.address : "";
        }
      },
      {
        data: null,
        render: d => {
          return d.gender || "";
        }
      },
      {
        data: null,
        render: d => {
          if (!d.dob) return "";
          else return moment(d.dob).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        render: d => {
          if (d.is_active)
            return `<input type="checkbox" checked onclick="$('#user-table').trigger('change-user-status', {source: this, userId:'${d._id}'})" />`;
          else
            return `<input type="checkbox" onclick="$('#user-table').trigger('change-user-status', {source: this, userId:'${d._id}'})" />`;
        }
      },
      {
        data: null,
        class: "text-center",
        render: function (data, type, full, meta) {
          return `&nbsp;&nbsp;
            <a href='/users/${data._id}' title='Edit Employee'><i class='fa fa-pencil'></i></a>&nbsp;&nbsp;`;
        }
      }
    ];
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
