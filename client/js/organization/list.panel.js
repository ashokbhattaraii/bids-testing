import config from "../config";
import { TablePanel } from "rumsan-ui";

class organizationTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/organizations?type=${cfg.name}`;
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
        data: null,
        render: d => {
          return d.address ? d.address : "";
        }
      },
      {
        data: null,
        class: "text-center",
        render: function(data, type, full, meta) {
          return `

          <a  href="/organizations/${data._id}" id="editOrganization" title='Edit Organization'

          data><i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a>`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }
}

export default organizationTable;
