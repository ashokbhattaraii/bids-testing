import { Modal, Form } from "rumsan-ui";
import Service from "./service";

class RequestLink extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.requestId = cfg.reqId;
    this.registerEvents("request-link-added");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.requestLink(this.requestId);
      }
    });
  }

  async requestLink(reqId) {
    let data = this.form.get();
    console.log("$$$$$$$$$$$ these are the data", data);
    let linkId = data._id;
    delete data._id;
    let resData = null;
    if (linkId) {
      resData = await Service.updateRequestLink(reqId, linkId, data);
    } else resData = resData = await Service.addRequestLink(reqId, data);
    if (!resData) return;
    this.form.clear();
    this.fire("request-link-added", resData);
    this.close();
  }

  openEditModal(id) {
    this.open();
    this.loadData(id);
  }

  async loadData(id) {
    let resData = await Service.getRequestLink(id);
    this.form.set(resData);
  }
}

export default RequestLink;
