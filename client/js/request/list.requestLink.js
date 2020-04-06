import { TablePanel } from "rumsan-ui";
import config from "../config";
import Service from "./service";

class LinkTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/requests/${cfg.reqId}/url`;
    super(cfg);
    this.id = cfg.reqId;
    this.registerEvents("open-link-modal", "edit-link-modal");
    this.render();
  }

  setColumns() {
    return [
      {
        data: null,
        render: d => {
          return d.created_for ? d.created_for : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          return d.url ? d.url : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          return d.duration ? d.duration : "N/A";
        }
      },
      {
        data: null,
        class: "text-center",
        render: function(data, type, full, meta) {
          return `<a onclick="$('#linksTable').trigger('edit-link-modal', '${data._id}')" id="editRequestLinks"  title='Edit Request Links'>
                  <i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a>
                  <a  href="/requests/edit/${data._id}" id="deleteRequestLinks" title='Delete Request ' data>
                  <i class='btn btn-primary btn-xs fa fa-trash user-icon'></i></a>`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }
}

export default LinkTable;
