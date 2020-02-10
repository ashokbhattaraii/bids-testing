import Service from "./service";
import Utils from "../utils";
import { Modal, Form } from "rumsan-ui";

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
    this.registerEvents("request-added");
    this.form = new Form({
      target: `${cfg.target} form`,
      onSubmit: () => {
        e.preventDefault();
        this.addRequest();
      }
    });

    this.on("request-added", (d, e) => {
      this.form.clear();
      this.close();
    });
  }

  async addRequest() {
    let data = this.form.get();
    data.blood_group = Utils.splitBlood(data.blood).group;
    data.rh_factor = Utils.splitBlood(data.blood).rh_factor;

    let resData = await Service.add(data);
    this.fire("request-added", resData);
  }
}

export default RequestAdd;
