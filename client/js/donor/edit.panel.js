import { TablePanel, Form } from "rumsan-ui";
import config from "../config";
import Service from "./service";

let req_products = [];

class DonorEdit extends TablePanel {
  constructor(cfg) {
    console.log("$$ this is the donor id", cfg.donorId);
    cfg.url = `${config.apiPath}/donors/${cfg.donorId}/donors_history`;
    super(cfg);
    this.render();
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

  setColumns() {
    return [
      {
        data: "source"
      },
      {
        data: "rate"
      },
      {
        data: "comments"
      },

      {
        data: "status"
      }
    ];
  }

  async loadData(donorId) {
    let data = await Service.get(donorId);
    data.last_donated_date = data.last_donated_date
      ? moment(data.last_donated_date).format("YYYY-MM-DD")
      : null;
    data.bloodgroup = data.blood_info.group;
    data.rh_factor = data.blood_info.rh_factor;
    data.totalDonation = data.donations_legacy;
    this.form.set(data);
  }

  async editDonorData(donorId) {
    let data = this.form.get();
    data.blood_group = data.bloodgroup + data.rh_factor;
    data.status = $("#status").val();
    let resData = await Service.edit(donorId, data);
  }
}

export default DonorEdit;
