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
          <div class=row>
          <div class="col-sm-4"><a href="/organizations/employee/${data._id}" id="editEmployee" title='Edit Employee'
          data><i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a></div>
          <div class="col-sm-4"><a onclick="$('#tbl${data.type}').trigger('delete-org','${data._id}')" id="deleteOrganization" title='Delete Organization'
          data><i class='btn btn-danger btn-xs fa fa-trash user-icon'></i></a></div></div>
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
