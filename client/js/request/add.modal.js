import { Modal } from "../core";
import Service from "./service";
import Utils from "../utils";
import { Form } from "rs-utils";
const RSForm = Form($);

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
    this.addEvents("request-added");
    this.form.submit(e => {
      e.preventDefault();
      this.addRequest();
    });
  }

  async addRequest() {
    let data = RSForm.get(`${this.target} form`);
    data.blood_group = Utils.splitBlood(data.blood).group;
    data.rh_factor = Utils.splitBlood(data.blood).rh_factor;

    let resData = await Service.add(data);
    this.fire("request-added", resData);
    RSForm.clear(this.form);
    this.close();
  }
}

export default RequestAdd;
