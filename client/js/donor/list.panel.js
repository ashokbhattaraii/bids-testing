import config from "../config";
import { TablePanel, Form, Notify } from "rumsan-ui";
import Service from "./service";

class UserTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/donors`;
    super(cfg);
    this.render();
    this.registerEvents("open-rating-modal", "upload-verified-excel-file", "donor-history-saved");
    this.donorRatingForm = new Form({
      target: `#frmDonorHistoryAdd`,
      onSubmit: () => {
        this.saveDonorHistory();
      }
    });

    this.on("open-rating-modal", (d, e) => {
      const [id, name] = e.split(',');
      this.openRatingModal(id, name);
    });

    this.on("upload-verified-excel-file", (d, e) => {
      this.uploadExcelFile();
    });

    this.on("donor-history-saved", (e, d) => {
      $("#mdlDonorHistoryAdd").modal("hide");
      this.donorRatingForm.clear()
      Notify.show(`Rating has been saved successfully for ${d.name}.`)
      this.reload();
    });
  }

  setColumns() {
    return [
      {
        data: "name"
      },
      {
        data: "phone"
      },
      {
        data: "gender"
      },

      {
        data: null,
        render: d => {
          return d.address ? d.address : "";
        }
      },
      {
        data: null,
        render: d => {
          return d.blood_info
            ? (d.blood_info.group ? d.blood_info.group : "") +
            (d.blood_info.rh_factor ? d.blood_info.rh_factor : "")
            : "";
        }
      },
      {
        data: null,
        render: d => {
          return d.status ? d.status : "";
        }
      },
      {
        data: null,
        render: data => {
          if (!data.last_contacted_date) return "";
          else return moment(data.last_contacted_date).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        render: data => {
          if (!data.last_donated_date) return "";
          else return moment(data.last_donated_date).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        render: data => {
          return data.donations_legacy ? data.donations_legacy.length : 0;
        }
      },
      {
        data: null,
        render: d => {
          return d.donorRating ? Math.round(d.donorRating) : "N/A"
        }
      },
      {
        data: null,
        class: "text-center",
        render: function (data, type, full, meta) {
          return `<a  href="/donors/edit/${data._id}" id="editDonor" title='Edit Donor'data>
          <i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a>
          <a onclick="$('#tblDonor').trigger('open-rating-modal', '${data._id},${data.name}')" id="rateDonors"  title='Rate Donors'>
          <i class='btn btn-primary btn-xs fa fa-star user-icon'></i></a>`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  async uploadExcelFile() {
    try {
      $("#verified-spin-loader").removeAttr("style");
      $("#upload-excel-file-button").attr("style", "display:none;")
      let excel_file = $("#verifiedExcelFile").val();
      if (!excel_file) return Notify.error("Please select an excel file to upload.");
      let formData = new FormData();
      formData.append("file", $("form input[type=file]")[0].files[0]);
      let me = this

      $.ajax({
        type: "POST",
        url: "/api/v1/donors/verified/upload",
        data: formData,
        processData: false,
        contentType: false,
        async: true,
        success: function (d) {
          if (d) {
            const report = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(d.rejected_donors));
            const a = document.getElementById('uploadedVerifiedReport');
            a.href = 'data:' + report;
            a.download = 'data.txt';
            a.innerHTML = 'download .txt file of json';
            a.click();
            $("input[type=file]").val("");
            Notify.show("Upload Successful")
            $("#mdlVerifiedExcelFileUpload").modal("hide");
            $("#upload-excel-file-button").removeAttr("style");
            $("#verified-spin-loader").attr("style", "display:none;")
            me.reload()
          }
        }
      });
    } catch (e) {
      Notify.error("Something went wrong, try another file.");
      console.log("ERR:", e);
    }
  }

  async saveDonorHistory() {
    let rData = this.donorRatingForm.get();
    let userData = await Service.get(rData.donorId);
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
    await Service.edit(rData.donorId,payload);
    let resData = await Service.addDonorHistory(rData);
    this.fire("donor-history-saved", resData)
  }

  openRatingModal(val, name) {
    $("#mdlDonorHistoryAdd").modal("show");
    this.loadDonorHistory(val);
    this.loadDates(val);              //to get last contacted and last donated dates
    $("#donorName").text(name);
  }

  async loadDates(id){
    $("#lastContacted").val('');
    $("#lastDonated").val('');
    let data = await Service.get(id);
    if(data && data.last_contacted_date) $("#lastContacted").val(moment(data.last_contacted_date).format("YYYY-MM-DD"));
    if(data &&data.last_donated_date) $("#lastDonated").val(moment(data.last_donated_date).format("YYYY-MM-DD"));
    
  }

  async loadDonorHistory(id) {
    let data = await Service.getDonorRating(id);
    let resData = "";
    if (data.length > 0) {

      for (var i = data.length-1; i >=0; i--) {
        resData += `<div class="card">
                      <div class="mb-2">
                        <div class="card-header text-white bg-secondary text-left">
                            <h5 class="card-title">Comments-</h5>
                        </div>
                        <div class="card-footer text-left">
                            <div class="row">
                              <div class="col-md-12">
                                <small class="text-muted "><strong>CommunicationType -&nbsp;</strong>${data[i].communication_type}</small>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-12">
                                  <small class="text-muted "><i class="fa fa-star"></i> <strong>Rating -&nbsp;
                                    </strong>${data[i].rating}</small>
                              </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <small class="text-muted "><strong>Feedback -&nbsp;</strong>${data[i].feedback?data[i].feedback:''} </small>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <small class="text-muted "><strong>Remarks -&nbsp;</strong>${data[i].remarks} </small>
                                </div>
                            </div>
                        </div>
                      </div>
                    </div>`;
      }

    } else {
      resData = "<h2>No Comments and Rating to show.</h2>";
    }
    $("#donor_id").val(id);
    $("#request_id").val(this.id);
    $("#donorHistory").html(resData);
  }
}

export default UserTable;
