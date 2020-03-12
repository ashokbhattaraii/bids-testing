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
    this.loadData(this.organizationId);
  }

  async loadData(orgId) {
    let data = await Service.getOrganization(orgId);
    this.form.set(data);
  }

  async editOrganization() {
    let data = this.form.get();
    let resData = await Service.editOrganization(this.organizationId, data);
  }
}

export default OrganizationEdit;
