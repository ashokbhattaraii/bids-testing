import { Component, Form, Notify } from "rumsan-ui";
import Service from "./service";

class OrganizationAdd extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("org-added", "additional-contact");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.addOrganization();
      }
    });

    this.on("additional-contact", (d, e) => {
      this.appendContactFields();
    });

    this.on("org-added", (d, e) => {
      this.form.clear();
      window.location.href = "/";
    });
  }

  async addOrganization() {
    let data = this.form.get();
    data.secondary = { contact_source: [], contact_detail: [] }
    // data.secondary.contact_source = [];
    // data.secondary.contact_detail = [];
    $(`${this.formId} select[name='contact_source']`).each(function (i, v) {
      data.secondary.contact_source.push(this.value);
    });
    $(`${this.formId} input[name='contact_detail']`).each(function (i, v) {
      data.secondary.contact_detail.push(this.value);
    });
    let resData = await Service.addOrganization(data);
    if(resData && !resData.success) return Notify.error(resData.message)
    this.fire("org-added", resData);
  }

  appendContactFields() {
    let contactFields = "";

    contactFields += `<div class="row"><div class="col-md-6">
    <select class="form-control" name="contact_source" required data-group="secondary">
    <option value="">Select Option</option>
    <option value="landline">Landline</option>
    <option value="mobile">Mobile</option>
    </select>
    </div>
    <div class="col-md-6">
    <input
      type="text"
      name="contact_detail"
      placeholder="Enter Contact Detail"
      class="form-control"
      data-validation="required"
    />
  </div></div>`;
    $("#contact_fields_add").append(contactFields);
  }
}

export default OrganizationAdd;
