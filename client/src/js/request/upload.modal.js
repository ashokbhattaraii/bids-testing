import { Modal } from "../core";
import Service from "./service";

class UploadModal extends Modal {
  constructor(cfg) {
    super(cfg);

    this.on("open", e => {});
  }

  uploadToS3(d) {
    let file = $("#fileselector").get(0).files[0];
    var formData = new FormData();
    Object.keys(d.params).forEach(key => formData.append(key, d.params[key]));
    formData.append("file", file, file.name);
    $.ajax(d.endpoint_url, {
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: (a, c, data) => {
        let location = $(data.responseXML)
          .find("Location")
          .text();
        sendLocationUrlToMyServer(location);
      }
    });
  }

  async open() {
    this.s3Policy = await Service.getS3Policy({ filename: "test.png" });
    console.log(this.s3Policy);
    if (!this.dropzone)
      this.dropzone = new Dropzone(`#dropzoneForm`, {
        url: this.s3Policy.endpoint_url,
        method: "post",
        autoProcessQueue: true,
        maxfiles: 5,
        timeout: null,
        parallelUploads: 3,
        maxThumbnailFilesize: 8, // 3MB
        paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 10, // MB
        dictDefaultMessage: "<strong>Drop files here or click to upload </strong>",
        sending: (file, xhr, formData) => {
          $.each(file.postData, function(k, v) {
            formData.append(k, v);
          });
          Object.keys(this.s3Policy.params).forEach(key =>
            formData.append(key, this.s3Policy.params[key])
          );
        }
      });
    super.open();
  }
}

export default UploadModal;
