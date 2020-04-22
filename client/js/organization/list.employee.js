import config from "../config";
import { TablePanel } from "rumsan-ui";

class EmployeeTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/organizations/${cfg.organizationId}/employee`;
    super(cfg);
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
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }
}

export default EmployeeTable;
