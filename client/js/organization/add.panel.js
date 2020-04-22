import { Component, Form } from "rumsan-ui";
import Service from "./service";

class OrganizationAdd extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("org-added");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.addOrganization();
      }
    });

    this.on("org-added", (d, e) => {
      this.form.clear();
      window.location.href = "/";
    });
  }

  async addOrganization() {
    let data = this.form.get();
    let resData = await Service.addOrganization(data);
    this.fire("org-added", resData);
  }
}

export default OrganizationAdd;
