import { Modal } from "rumsan-ui";
import Service from "./service";
import uuid from "uuid-random";

class OpenChoice extends Modal {
  constructor(cfg) {
    super(cfg);
    this.requestId = cfg.requestId;
    this.registerEvents("select-org", "select-donors");

    this.btnDonors = $(`${this.target} .btnDonors`);
    this.btnRequest = $(`${this.target} .btnOrganization`);

    this.btnDonors.on("click", () => this.fire("select-donors", this.requestId));
    this.btnRequest.on("click", () => this.fire("select-org", this.requestId));
  }

  openModal(reqId) {
    this.requestId = reqId;
    this.open();
  }
}

export default OpenChoice;
