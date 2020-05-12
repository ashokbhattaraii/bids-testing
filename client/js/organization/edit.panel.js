import { Component, Form } from "rumsan-ui";
import Service from "./service";

class OrganizationEdit extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.organizationId = cfg.organizationId;
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.editOrganization();
      }
    });
    this.registerEvents("organization-edited", "secondary-contact");
    this.loadData(this.organizationId);

    this.on("organization-edited", (d, e) => {
      this.form.clear();
      window.location.href = "/";
    });

    this.on("secondary-contact", (d, e) => {
      this.appendContactFields();
    });
  }

  async loadData(orgId) {
    let data = await Service.getOrganization(orgId);
    console.log("%%%%%%%%% this to be loaded data", data.contacts.secondary.contact_detail.length);
    let conatct_details = "";
    for (var i = 0; i < data.contacts.secondary.contact_detail.length; i++) {
      conatct_details += `<div class="row"><div class="col-md-6">
      <input
        type="text"
        name="contact_source"
        placeholder="Enter Contact Source"
        class="form-control"
        data-group="secondary"
        value="${data.contacts.secondary.contact_source[i]}"
        data-validation="length alphanumeric required"
        data-validation-length="7-15"
      />
    </div>
    <div class="col-md-6">
      <input
        type="text"
        name="contact_detail"
        value="${data.contacts.secondary.contact_detail[i]}"
        placeholder="Enter Contact Detail"
        data-group="secondary"
        class="form-control"
        data-validation="length alphanumeric required"
        data-validation-length="7-15"
      />
    </div></div>`;
    }
    $("#contact_fields_edit").append(conatct_details);
    this.form.set(data);
  }

  async editOrganization() {
    let data = this.form.get();

    data.secondary.contact_source = [];
    data.secondary.contact_detail = [];
    $(`${this.formId} input[name='contact_source']`).each(function (i, v) {
      data.secondary.contact_source.push(this.value);
    });
    $(`${this.formId} input[name='contact_detail']`).each(function (i, v) {
      data.secondary.contact_detail.push(this.value);
    });
    console.log("************** this is the data", data);

    let resData = await Service.editOrganization(this.organizationId, data);
    this.fire("organization-edited", resData);
  }

  appendContactFields() {
    let contactFields = "";
    contactFields += `<div class="row"><div class="col-md-6">
    <input
      type="text"
      name="contact_source"
      placeholder="Enter Contact Source"
      class="form-control"
      data-group="secondary"
      data-validation="length alphanumeric required"
      data-validation-length="7-15"
    />
  </div>
  <div class="col-md-6">
    <input
      type="text"
      name="contact_detail"
      placeholder="Enter Contact Detail"
      data-group="secondary"
      class="form-control"
      data-validation="length alphanumeric required"
      data-validation-length="7-15"
    />
  </div></div>`;

    $("#contact_fields_edit").append(contactFields);
  }
}

export default OrganizationEdit;
