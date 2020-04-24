import { TablePanel } from "rumsan-ui";
import config from "../config";
import Service from "./service";

class LinkTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/requests/${cfg.reqId}/url`;
    super(cfg);
    this.id = cfg.reqId;
    this.registerEvents("open-link-modal", "edit-link-modal", "delete-expiry-link");
    this.render();

    this.on("delete-expiry-link", (d, e) => {
      this.removeExpiryLink(e);
    });
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
          return d.url
            ? `<a href="${d.url}" id="shareableLink">${d.url}
        </a>`
            : "N/A";
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
        render: function (data, type, full, meta) {
          return `<a onclick="$('#linksTable').trigger('edit-link-modal', '${data._id}')" id="editRequestLinks"  title='Edit Request Links'>
                  <i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a>
                  <a onclick="$('#linksTable').trigger('delete-expiry-link', '${data._id}')" id="deleteRequestLinks" title='Delete Request ' data>
                  <i class='btn btn-primary btn-xs fa fa-trash user-icon'></i></a>`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  async removeExpiryLink(id) {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    try {
      if (isConfirm.value) {
        await Service.removeExpiryLink(id);
        this.reload();
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default LinkTable;
