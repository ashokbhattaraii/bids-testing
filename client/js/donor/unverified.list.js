import config from "../config";
import { TablePanel } from "rumsan-ui";

class UnverifiedDonorTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/donors/unverified`;
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
          return d.blood_group ? d.blood_group : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          if (d.is_verified)
            return `<input type="checkbox" checked onclick="changeDonorStatus('${d._id}', this)" />`;
          else return `<input type="checkbox" onclick="changeDonorStatus('${d._id}', this)" />`;
        }
      },
      {
        data: null,
        render: d => {
          if (d.agree_to_donate == "yes") {
            d.agree_to_donate = "Yes";
          } else if (d.agree_to_donate == "no") {
            d.agree_to_donate = "No";
          }
          return d.agree_to_donate ? d.agree_to_donate : "N/A";
        }
      },
      {
        data: null,
        class: "text-center",
        render: (d, type, full, meta) => {
          return `<a onclick="setEditForm('${d._id}');" title='Edit' class= 'text-right'>
          <i class='fa fa-edit'></i></a>&nbsp;&nbsp;
          <a onclick="removeUnverifiedDonor('${d._id}');" title='Delete' class= 'text-right'>
          <i class='fa fa-trash'></i></a>&nbsp;&nbsp;`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }
}

export default UnverifiedDonorTable;
