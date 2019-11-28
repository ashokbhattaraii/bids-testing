import { Modal } from "../core";
import Service from "./service";

class UploadModal extends Modal {
  constructor(cfg) {
    super(cfg);
    this.dropzone = new Dropzone(`${cfg.target} .dropzone`);
    this.events = ["request-added"];

    this.dropzone.on("addedfile", e => {
      console.log(e);
    });
  }
}

export default UploadModal;
