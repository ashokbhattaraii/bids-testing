import config from "../config";
import { Component, Form } from "rumsan-ui";

class editOrganization extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = cfg.target;
    this.form = new Form({
      target: this.formId
    });
  }

  editOrganizations() {
    let data = this.form.get();
  }
}

export default editOrganization;
