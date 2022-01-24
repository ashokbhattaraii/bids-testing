import { Modal, Form,Notify } from "rumsan-ui";
import Service from "./service";
import DonorService from "../donor/service";
import CryptoJS from "crypto-js";

class DonorHistoryAdd extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("open-rating-modal", "save-donor-history","rating-added");
    this.id = cfg.id;
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.saveDonorHistory();
      }
    });

    this.on("open-rating-modal", (d, e) => {
      const [id, name] = e.split(',');
      this.openRatingModal(id, name);
    });

    this.on("close", e => {
      this.form.clear();
    });
  }
  openRatingModal(val, name) {
    $("#mdlDonorHistoryAdd").modal("show");
    this.loadDates(val);
    this.loadDonorHistory(val);  
    $("#donorName").text(name);
  }

  toggleStatusNote(value) {
    if (value === "active") {
      $("#status_note").css("display", "none");
    } else {
      $("#status_note").css("display", "");
    }
  }

  async saveDonorHistory() {
    try{
      let rData = this.form.get();
      let userData = await DonorService.get(rData.donorId);
      let payload = {
        lastContacted : rData.lastContacted,
        last_donated_date : rData.lastDonated,
        name: userData.name,
        phone: userData.phone,
        date: userData.date,
        gender: userData.gender,
        email: userData.email,
        address: userData.address,
        bloodgroup: userData.bloodgroup,
        rh_factor: userData.rh_factor,
        status: userData.status,
        source: userData.source,
        status_note: userData.status_note,
        blood_group: userData.blood_group
      }
      await DonorService.edit(rData.donorId,payload); 
      await Service.addHistory(rData);
      $("#mdlDonorHistoryAdd").modal("hide");
      this.trigger("rating-added")
      Notify.show('Rating has been saved successfully.');
    }
    catch(e){
      console.log(e.response);
    }
  }

  async loadDates(id){
    $("#lastContacted").val('');
    $("#lastDonated").val('');
    if(data.last_contacted_date) $("#lastContacted").val(moment(data.last_contacted_date).format("YYYY-MM-DD"));
    if(data.last_donated_date) $("#lastDonated").val(moment(data.last_donated_date).format("YYYY-MM-DD"));
  }

  async loadDonorHistory(id) {
    let data = await Service.getDonorRating(id);
    let resData = "";
    if (data.length > 0) {
     for (let i = data.length-1; i >=0; i--) {
        resData += `<div class="card">
                      <div class="mb-2">
                        <div class="card-header text-white bg-secondary text-left">
                            <h5 class="card-title">Comments-</h5>
                        </div>
                        <div class="card-footer text-left">
                            <div class="row">
                              <div class="col-md-12">
                                <small class="text-muted "><strong>CommunicationType-</strong>${data[i].communication_type}</small>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-12">
                                  <small class="text-muted "><i class="fa fa-star"></i> <strong>Rating-
                                    </strong>${data[i].rating}</small>
                              </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <small class="text-muted "><strong>Feedback -&nbsp;</strong>${data[i].feedback?data[i].feedback:''} </small>
                                </div>
                            </div>
                            <div class="row>
                                <div class="col-md-12">
                                    <small class="text-muted "><strong>Remarks-</strong>${data[i].remarks} </small>
                                </div>
                            </div>
                        </div>
                      </div>
                    </div>`;
                        
      }
      
    } else {
      
      for (var i = 1; i <= 5; i++) {
        $(`#star${i}`).val(i);
      }
     
      resData = "<h2>No Comments and Rating to show.</h2>";
    }
    $("#donor_id").val(id);
    $("#request_id").val(this.id);
    $("#donorHistory").html(resData);
  }
}

export default DonorHistoryAdd;
