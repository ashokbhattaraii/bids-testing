import config from "../config";
import { TablePanel } from "rumsan-ui";

class EmployeeTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/organizations/${cfg.organizationId}/employee`;
    super(cfg);
    this.registerEvents("edit-employee");
    this.orgId = cfg.organizationId;
    this.render();
  }

  setColumns() {
    return [
      { data: "name.full" },
      {
        data: null,
        render: d => {
          return d.phone || "";
        }
      },
      {
        data: null,
        render: d => {
          return d.email || "";
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
        class: "text-center",
        render: function (data, type, full, meta) {
          return `
          <a href="/organizations/employee/${data._id}" class="btn btn-primary btn-xs" type="button" id="editEmployee" title='Edit Employee'
          data><i class='fa fa-edit user-icon'></i></a>
          <button type="button" class="btn btn-xs btn-danger" id="deleteEmployee" title='Delete Employee' value='${data._id}'
          data><i class='fa fa-trash user-icon'></i></button>
          `;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }
}

export default EmployeeTable;
