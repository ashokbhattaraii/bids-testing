import { TablePanel, Form } from "rumsan-ui";
import config from "../config";
import Service from "./service";

let req_products = [];

class DonorEdit extends TablePanel {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.donorId = cfg.donorId;
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.editDonorData(this.donorId);
      }
    });
    this.loadData(this.donorId);
  }

  async loadData(donorId) {
    let data = await Service.get(donorId);
    data.last_donated_date = data.last_donated_date
      ? moment(data.last_donated_date).format("YYYY-MM-DD")
      : null;
    data.lastContacted = data.last_contacted_date
      ? moment(data.last_contacted_date).format("YYYY-MM-DD")
      : null;
    data.bloodgroup = data.blood_info ? data.blood_info.group : "";
    data.rh_factor = data.blood_info ? data.blood_info.rh_factor : "";
    data.totalDonation = data.donations_legacy;

    this.form.set(data);
  }

  async editDonorData(donorId) {
    let data = this.form.get();
    data.blood_group = data.bloodgroup + data.rh_factor;
    let resData = await Service.edit(donorId, data);
  }
}

export default DonorEdit;
