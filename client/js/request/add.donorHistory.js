import { Modal, Form } from "rumsan-ui";
import Service from "./service";
import CryptoJS from "crypto-js";

class DonorHistoryAdd extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("open-rating-modal", "save-donor-history");
    this.id = cfg.id;
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.saveDonorHistory();
      }
    });

    this.on("open-rating-modal", (d, e) => {
      this.openRatingModal(e);
    });

    this.on("close", e => {
      this.form.clear();
    });
  }
  openRatingModal(val) {
    this.loadDonorHistory(val);
    $("#mdlDonorHistoryAdd").modal("show");
  }

  toggleStatusNote(value) {
    if (value === "active") {
      $("#status_note").css("display", "none");
    } else {
      $("#status_note").css("display", "");
    }
  }

  async saveDonorHistory() {
    let rData = this.form.get();

    const newHash = CryptoJS.MD5(
      JSON.stringify({
        status: rData.status,
        status_note: rData.status_note,
        last_request_date: rData.last_request_date,
        rating: rData.rating,
        communication_type: rData.comm_type,
        communication_text: rData.comments
      })
    ).toString();

    if (newHash === this.hash) {
      $("#mdlDonorHistoryAdd").modal("hide");
    } else {
      let resData = await Service.addHistory(this.id, rData);
      $("#mdlDonorHistoryAdd").modal("hide");
    }
  }

  async loadDonorHistory(id) {
    let data = await Service.getDonorHistory(id);
    let resData = "";
    if (data.length > 0) {
      data[0].last_request_date = data[0].last_request_date
        ? moment(data[0].last_request_date).format("YYYY-MM-DD")
        : "";
      this.hash = CryptoJS.MD5(
        JSON.stringify({
          status: data[0].status,
          status_note: data[0].status_note,
          last_request_date: data[0].last_request_date,
          rating: `${data[0].rating}`,
          communication_type: data[0].notes[data[0].notes.length - 1].type,
          communication_text: data[0].notes[data[0].notes.length - 1].text
        })
      ).toString();

      data[0].comm_type = data[0].notes[data[0].notes.length - 1].type;
      this.toggleStatusNote(data[0].status);
      this.form.set(data[0]);
      for (var i = 1; i <= data[0].rating; i++) {
        $(`#star${i}`).prop("checked", true);
      }
      $("#donorId").val(id);
      for (var i = data[0].notes.length - 1; i >= 0; i--) {
        resData += `<div class="card">
        <div class="mb-2">
        <div class="card-header text-white bg-secondary text-left">
                            <h5 class="card-title">Comments-${data[0].notes[i].text}</h5>
                        </div>
                        <div class="card-footer text-left">
                            <div class="row">
                              <div class="col-md-12">
                                <small class="text-muted "><strong>CommunicationType-</strong>${data[0].notes[i].type}</small>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-12">
                                  <small class="text-muted "><i class="fa fa-star"></i> <strong>Rating-
                                    </strong>${data[0].notes[i].rating}</small>
                              </div>
                            </div>
                            <div class="row>
                                <div class="col-md-12">
                                    <small class="text-muted "><strong>Status-</strong>${data[0].notes[i].status} </small>
                                </div>
                            </div>
                        </div></div></div>`;
      }
    } else {
      this.form.clear();
      for (var i = 1; i <= 5; i++) {
        $(`#star${i}`).val(i);
      }
      $("#donorId").val(id);
      resData = "<h2>No Comments and Rating to show.</h2>";
    }

    $("#donorHistory").html(resData);
  }
}

export default DonorHistoryAdd;
