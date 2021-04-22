import config from "../config";
import { TablePanel, Form ,Notify} from "rumsan-ui";
import Service from "./service";

class UserTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/donors`;
    super(cfg);
    this.render();
    this.registerEvents("open-rating-modal");
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
           return d.donorRating ? Math.round(d.donorRating) :"N/A"
        }
      },
      {
        data: null,
        class: "text-center",
        render: function(data, type, full, meta) {
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

  async saveDonorHistory() {
    let rData = this.donorRatingForm.get();
    let resData = await Service.addDonorHistory( rData);
    $("#mdlDonorHistoryAdd").modal("hide");
    Notify.show('Rating has been saved successfully.')
    this.reload();
  }

  openRatingModal(val, name) {
    this.loadDonorHistory(val);
    $("#mdlDonorHistoryAdd").modal("show");
    $("#donorName").text(name);
    $("#donor_id").val(val);
  }

  async loadDonorHistory(id) {
    let data = await Service.getDonorRating(id);
    
    
    let resData = "";
    if (data.length > 0) {
      // data[0].last_request_date = data[0].last_request_date
      //   ? moment(data[0].last_request_date).format("YYYY-MM-DD")
      //   : "";
      // // this.hash = CryptoJS.MD5(
      // //   JSON.stringify({
      // //     status: data[0].status,
      // //     status_note: data[0].status_note,
      // //     last_request_date: data[0].last_request_date,
      // //     rating: `${data[0].rating}`,
      // //     communication_type: data[0].notes[data[0].notes.length - 1].type,
      // //     communication_text: data[0].notes[data[0].notes.length - 1].text
      // //   })
      // // ).toString();

      // data[0].communication_type = data[0].notes[data[0].notes.length - 1].type;
      // this.toggleStatusNote(data[0].status);
      // this.form.set(data[0]);
     
      for (var i =0; i < data.length; i++) {
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
                            <div class="row>
                                <div class="col-md-12">
                                    <small class="text-muted "><strong>Remarks-</strong>${data[i].remarks} </small>
                                </div>
                            </div>
                        </div></div></div>`;
      }
      this.donorRatingForm.clear();
    } else {
      this.donorRatingForm.clear();
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

export default UserTable;
