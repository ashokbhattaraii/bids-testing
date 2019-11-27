import { RS, Modal } from "../core";
import Service from "./service";
import Utils from "../utils";

var validations = [
  {
    name: "requester_name",
    rules: [
      {
        name: "required",
        message: "field is required"
      }
    ]
  }
];

class RequestAdd extends Modal {
  constructor(cfg) {
    super(cfg);
    this.form = $(`${cfg.target} form`);
    this.events = ["request-added"];

    this.form.submit(e => {
      e.preventDefault();
      this.addRequest();
    });
  }

  async addRequest() {
    let data = RS.form.get(`${this.target} form`);
    data.blood_group = Utils.splitBlood(data.blood).group;
    data.rh_factor = Utils.splitBlood(data.blood).rh_factor;

    let resData = await Service.add(data);
    this.fire("request-added", resData);
    RS.form.clear(this.form);
    this.close();
  }
}

export default RequestAdd;
