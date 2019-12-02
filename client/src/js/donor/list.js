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
      url: "/api/v1/donors",
      columns: [
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
          render: data => {
            if (!data.lastContacted) return "";
            else return moment(data.lastContacted).format("YYYY-MM-DD");
          }
        },
        {
          data: null,
          render: data => {
            if (!data.last_donated_date) return "";
            else return moment(data.last_donated_date).format("YYYY-MM-DD");
          }
        },
        {
          data: null,
          render: data => {
            return data.donations_legacy ? data.donations_legacy.length : 0;
          }
        },
        {
          data: null,
          class: "text-center",
          render: function(data, type, full, meta) {
            return ` 

            <a  href="/donors/edit/${data._id}" id="editDonor" title='Edit Donor'

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
