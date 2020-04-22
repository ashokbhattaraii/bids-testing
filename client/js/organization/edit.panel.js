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
    this.registerEvents("organization-edited");
    this.loadData(this.organizationId);

    this.on("organization-edited", (d, e) => {
      this.form.clear();
      window.location.href = "/";
    });
  }

  async loadData(orgId) {
    console.log(orgId);
    let data = await Service.getOrganization(orgId);
    this.form.set(data);
  }

  async editOrganization() {
    let data = this.form.get();
    let resData = await Service.editOrganization(this.organizationId, data);
    this.fire("organization-edited", resData);
  }
}

export default OrganizationEdit;
