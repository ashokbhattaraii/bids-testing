import config from "../config";
import { TablePanel } from "rumsan-ui";

class UserTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/donors`;
    super(cfg);
    this.render();
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
          return d.blood_info ? d.blood_info.group + d.blood_info.rh_factor : "";
        }
      },
      {
        data: null,
        render: data => {
          if (!data.last_contacted_date) return "";
          else return moment(data.last_contacted_date).format("YYYY-MM-DD");
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
    ];
  }

  reload() {
    this.table.ajax.reload();
  }
}

export default UserTable;
