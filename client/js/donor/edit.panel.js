import { Panel, Form, Notify } from "rumsan-ui";
import config from "../config";
import Service from "./service";

let req_products = [];

class DonorEdit extends Panel {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.donorId = cfg.donorId;
    this.registerEvents("donor-updated");
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
    let additionalDonorData = await Service.getDonorHistory(donorId); 
    data.dob = data.dob
      ? moment(data.dob).format("YYYY-MM-DD")
      : null;    
    data.last_donated_date = data.last_donated_date
      ? moment(data.last_donated_date).format("YYYY-MM-DD")
      : null;
    data.lastContacted = data.last_contacted_date
      ? moment(data.last_contacted_date).format("YYYY-MM-DD")
      : null;
    data.bloodgroup = data.blood_info ? data.blood_info.group : "";
    data.rh_factor = data.blood_info ? data.blood_info.rh_factor : "";
    data.totalDonation = data.donations_legacy;
    if(additionalDonorData[0]){
      data.source = additionalDonorData[0].source;
      data.status = additionalDonorData[0].status; 
      data.status_note = additionalDonorData[0].status_note; 
    }
    this.form.set(data);
  }

  async editDonorData(donorId) {
    let data = this.form.get();
    data.blood_group = data.bloodgroup + data.rh_factor;
    let resData = await Service.edit(donorId, data);
    Notify.show("Donor Data Updated Successfully");
    setTimeout(function () {
      window.location.reload();
    }, 1000);
  }
}

export default DonorEdit;
