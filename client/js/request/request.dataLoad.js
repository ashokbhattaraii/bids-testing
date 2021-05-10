import { Component, Form, Modal, TablePanel } from "rumsan-ui";
import Service from "./service";
import config from "../config";

let req_products = [];

class RequestDataLoad extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = cfg.target;
    this.requestId = cfg.requestId;
    this.form = new Form({
      target: this.formId
    });

    this.loadData(this.requestId);
  }

  async loadData(requestId) {
    let data = await Service.get(requestId);
    data.blood = data.blood_group + data.rh_factor;
    data.requested_date = moment(data.requested_date).format("YYYY-MM-DD");
    this.setComponents(data.requested_products);
    this.form.set(data);
  }

  getRequestedBloodType() {
    var me = this;
    $("input:checkbox.req-products").each(function () {
      let val = this.checked ? $(this).val() : "";
      if (val) {
        let data = me._product(val);
        if (data) {
          req_products.push(data);
        }
      }
    });
  }

  setComponents(data) {
    let inputCheckValue = [];
    var a = 0;
    $("input:checkbox.req-products").each(function () {
      inputCheckValue.push($(this).val());
      for (a in data) {
        if (data[a].blood_type == $(this).val()) {
          $(this).attr("checked", true);
          $("#" + data[a].blood_type).css("display", "");
          parseInt($("#" + data[a].blood_type).val(data[a].quantity));
        }
      }
      a++;
    });
  }
}

class RequestAddDonor extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = `${cfg.target} form`;
    this.requestId = cfg.requestId;
    this.created_for = cfg.created_for;
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.addAdditionalDonors();
      }
    });
    this.registerEvents("donor-added");

    this.on("close", e => {
      this.form.clear();
    });
  }

  async addAdditionalDonors() {
    let data = this.form.get();
    data.created_by = this.created_for;
    let resData = await Service.addAdditionalDonors(this.requestId, data);
    if (!resData) return;
    this.close();
    this.fire("donor-added", resData);
  }
}

class RequestEditDonor extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = `${cfg.target} form`;
    this.requestId = cfg.requestId;
    this.created_for = cfg.created_for;
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.editAdditionalDonors();
      }
    });

    this.on("close", e => {
      this.form.clear();
    });

    this.registerEvents("donor-edited");
  }

  async loadDonorData(phone) {
    this.donor_phone = phone;
    let resData = await Service.getAdditionalDonorDetail(this.requestId);
    let index = resData.data.findIndex(x => x.phone === phone);
    this.form.set(resData.data[index]);
  }

  async editAdditionalDonors() {
    let data = this.form.get();
    data.donor_phone = this.donor_phone;
    data.created_by = this.created_for;
    let resData = await Service.editAdditionalDonors(this.requestId, data);
    if (!resData) return;
    this.close();
    this.fire("donor-edited", resData);
  }
}

class AdditionalDonorList extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/requests/${cfg.requestId}/shared-donors`;
    super(cfg);
    this.requestId = cfg.requestId;
    this.render();
    this.registerEvents("additional-donor-edit", "edit-link-modal");
    this.on("additional-donor-edit", (d, e) => {
      this.addAdditionalDonors();
    });
  }

  setColumns() {
    return [
      {
        data: null,
        render: d => {
          return d.name ? d.name : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          return d.phone ? d.phone : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          return d.address ? d.address : "N/A";
        }
      },
      {
        data: null,
        class: "text-center",
        render: function (data, type, full, meta) {
          return `<a onclick="$('.additionalDonorTable').trigger('edit-link-modal','${data.phone}')" id="editSharedRequestDonors"  title='Edit Donors'>
                  <i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a>
                  `;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  async addAdditionalDonors() {
    let data = this.form.get();
    let resData = await Service.addAdditionalDonors(this.requestId, data);
    if (!resData) return;
    this.close();
  }
}

export { RequestDataLoad, RequestAddDonor, AdditionalDonorList, RequestEditDonor };
