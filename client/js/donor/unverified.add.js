import { Modal, Form } from "rumsan-ui";

import Service from "./service";

class UnverifiedDonorAdd extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("unverified-donor-added");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.addUnverifiedDonor();
      }
    });

    this.on("unverified-donor-added", (d, e) => {
      this.form.clear();
      this.close();
    });
  }

  async addUnverifiedDonor() {
    let data = this.form.get();

    let resData = await Service.addUnverifiedDonor(data);
    if (!resData) return;
    this.fire("unverified-donor-added", resData);
  }
}

export default UnverifiedDonorAdd;
