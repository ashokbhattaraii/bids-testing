import config from "../config";
import { TablePanel } from "rumsan-ui";
import Service from "./service";

class organizationTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/organizations?type=${cfg.name}`;
    super(cfg);
    this.name = cfg.name;
    this.render();
    this.registerEvents("delete-org", "org-deleted");
    this.on("delete-org", (d, e) => {
      this.removeOrganization(e);
    });

    this.on("org-deleted", (d, e) => {
      window.location.reload();
    });
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
        render: function (data, type, full, meta) {
          return `
          <div class=row>
          <div class="col-sm-4"><a href="/organizations/${data._id}" id="editOrganization" title='Edit Organization'
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

  async removeOrganization(id) {
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
        let resData = await Service.removeOrganization(id);
        this.fire("org-deleted", resData);
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default organizationTable;
