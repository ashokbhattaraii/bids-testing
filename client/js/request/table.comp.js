import { Component, DataTable } from "../core";
import Services from "./service";

class UserTable extends Component {
  constructor(cfg) {
    super(cfg);
    this.table = this.makeTable(cfg);
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
            if (!data.requested_date) return "";
            else return moment(data.requested_date).format("YYYY-MM-DD");
          }
        },
        {
          data: null,
          render: data => {
            if (!data.status) return "";
            else return data.status;
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
}

export default UserTable;
