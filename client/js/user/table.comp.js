import config from "../config";
import { Component } from "../core";
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
    return $(cfg.target).DataTable({
      pageLength: 25,
      processing: true,
      responsive: true,
      filter: true,
      sort: false,
      serverSide: true,
      searchDelay: 500,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-4'i><'col-sm-8'<'float-right p-2'p>>>",
      ajax: {
        url: `${config.apiPath}/users`,
        headers: { access_token: Cookies.get("access_token") },
        dataFilter: data => {
          let json = JSON.parse(data);
          json.recordsTotal = json.total;
          json.recordsFiltered = json.total;
          return JSON.stringify(json);
        },
        data: function(d) {
          return $.extend({}, { start: d.start, limit: d.length, search: d.search.value });
        }
      },
      columns: [
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
            return d.dob || "";
          }
        },
        {
          data: null,
          render: d => {
            if (d.is_active)
              return `<input type="checkbox" checked onclick="$('${cfg.target}').trigger('change-user-status', {source: this, userId:'${d._id}'})" />`;
            else
              return `<input type="checkbox" onclick="$('${cfg.target}').trigger('change-user-status', {source: this, userId:'${d._id}'})" />`;
          }
        },
        {
          data: null,
          class: "text-center",
          render: function(data, type, full, meta) {
            return `&nbsp;&nbsp;
              <a href='/users/${data._id}' title='Edit Employee'><i class='fa fa-pencil'></i></a>&nbsp;&nbsp;`;
          }
        }
      ]
    });
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
