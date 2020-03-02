import { Modal } from "rumsan-ui";
import Service from "./service";

class OpenChoice extends Modal {
  constructor(cfg) {
    super(cfg);
    this.requestId = cfg.requestId;
    this.registerEvents("select-org", "select-donors");

    this.btnDonors = $(`${this.target} .btnDonors`);
    this.btnOrg = $(`${this.target} .btnOrganizations`);

    this.btnDonors.on("click", () => this.fire("select-donors", `${this.requestId},donor`));
    this.btnOrg.on("click", () => this.fire("select-org", `${this.requestId},organization`));
  }

  openModal(reqId) {
    this.requestId = reqId;
    this.open();
  }

  async saveRequestType(body) {
    await Service.saveRequestType(this.requestId, body);
  }
}

export default OpenChoice;
