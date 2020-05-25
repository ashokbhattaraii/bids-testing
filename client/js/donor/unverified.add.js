import { Modal, Form } from "rumsan-ui";

import Service from "./service";

class UnverifiedDonorAdd extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("unverified-donor-added", "open-edit-modal", "delete-unverified-donor");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.addUnverifiedDonor();
      }
    });

    this.on("open-edit-modal", (d, e) => {
      this.openEditModel(e);
    });
  }

  async addUnverifiedDonor() {
    let data = this.form.get();
    let resData = await Service.addUnverifiedDonor(data);
    if (!resData) return;
    this.fire("unverified-donor-added", resData);
  }

  openEditModel(id) {
    $("#unverified_id").val(id);
    this.open();
    this.loadData(id);
  }

  async loadData(id) {
    let data = await Service.getUnverifiedDonor(id);
    data.dob = moment(data.dob).format("YYYY-MM-DD");
    this.form.set(data);
  }
}

export default UnverifiedDonorAdd;
