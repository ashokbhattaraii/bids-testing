import { TablePanel } from "rumsan-ui";
import OpenChoice from "./choice.comp";
import config from "../config";
import Service from "./service";

class UserTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/requests`;
    super(cfg);
    this.render();
    this.registerEvents("open-choices");
  }

  setColumns() {
    return [
      {
        data: null,
        render: function (data) {
          return `<a href="/requests/edit/${data._id}">${data.patient_name}</a>`;
        }
      },
      {
        data: "requester_phone"
      },
      {
        data: null,
        render: d => {
          return d.requester_name ? `${d.requester_name}` : "N/A";
        }
      },
      {
        data: "hospital"
      },

      {
        data: null,
        render: d => {
          return d.blood_group ? `${d.blood_group}${d.rh_factor}` : "N/A";
        }
      },
      {
        data: null,
        render: data => {
          if (!data.requested_date) return "";
          else return moment(data.requested_date).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        render: d => {
          return d.request_type ? d.request_type : "";
        }
      },
      {
        data: null,
        render: data => {
          if (!data.status) return "";
          else return data.status;
        }
      },
      {
        data: null,
        render: data => {
          if (!data.createdAt) return "";
          else return moment(data.createdAt).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        class: "text-center",
        render: function (data, type, full, meta) {
          return `<a onclick="$('#tblRequest').trigger('open-choices', '${data._id}')" id="addDonors"  title='Add Donors'>
                  <i class='btn btn-primary btn-xs fa fa-plus user-icon'></i></a>
                  <a  href="/requests/edit/${data._id}" id="editRequest" title='Edit Request' data>
                  <i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a>
                  <a href="/requests/url/${data._id}" id="createLink" title='Create Expiry Link' data>
                  <i class='btn btn-primary btn-xs fa fa-link user-icon'></i></a>`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  async checkRequestType(id) {
    let resData = await Service.getDonorsLocal(id);
    return resData;
  }
}

export default UserTable;
