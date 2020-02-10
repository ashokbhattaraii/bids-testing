import { Modal } from "../core";
import Service from "./service";
import uuid from "uuid-random";

const docType = "req_form";
const s3Path = `bids/${docType}s`;

class UploadModal extends Modal {
  constructor(cfg) {
    super(cfg);

    this.addEvents("open-request", "select-donors");

    this.btnDonors = $(`${this.target} .btnDonors`);
    this.btnRequest = $(`${this.target} .btnRequest`);
    this.btnFileUpload = $(`${this.target} .btnFileUpload`);

    this.btnDonors.on("click", () => this.fire("select-donors", this.requestId));
    this.btnRequest.on("click", () => this.fire("open-request", this.requestId));
  }

  async open(reqId) {
    this.requestId = reqId;
    if (!this.dropzone)
      this.dropzone = new Dropzone(`${this.target} form`, {
        //url: this.s3Policy.endpoint_url,
        method: "post",
        autoProcessQueue: true,
        maxfiles: 5,
        timeout: null,
        parallelUploads: 3,
        maxThumbnailFilesize: 8, // 3MB
        paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 10, // MB
        dictDefaultMessage: "<strong>Drop files here or click to upload </strong>",
        accept: async (file, done) => {
          this.btnDonors.html("Uploading file...");
          this.btnFileUpload.attr("disabled", "disabled");
          let s3Policy = await Service.getS3Policy({ type: docType });
          this.dropzone.options.url = s3Policy.endpoint_url;
          file.postData = Object.assign(
            {
              key: `${s3Path}/${uuid()}`,
              "Content-Type": file.type
            },
            s3Policy.params
          );
          done();
        },
        success: async (file, responseXML) => {
          let location = $(responseXML)
            .find("Location")
            .text();
          await Service.addDocument(reqId, {
            type: docType,
            location
          });
          this.btnDonors.html("Select Donors");
          this.btnFileUpload.removeAttr("disabled");
        },
        sending: (file, xhr, formData) => {
          $.each(file.postData, function(k, v) {
            formData.append(k, v);
          });
        }
      });
    super.open();
  }
}

export default UploadModal;
