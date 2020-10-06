import config from "../config";
import { TablePanel, Notify } from "rumsan-ui";
import Service from "./service";
import Utils from "../utils";

class DispatchTable extends TablePanel {
  constructor(cfg) {
    cfg.url =
      `${config.apiPath}/requests/dispatch/${cfg.id}?group=` + encodeURIComponent(cfg.group);
    super(cfg);
    this.id = cfg.id;
    this.group = cfg.group;
    this.render();
    this.loadData(this.id);
    this.registerEvents(
      "show-local-donor",
      "remove-request-donor",
      "check-donors",
      "copy-text",
      "add-organization"
    );

    this.on("copy-text", (d, e) => {
      Utils.copyText(e);
      window.location.replace(`/requests/edit/${this.id}`);
    });

    this.on("show-local-donor", (d, e) => {
      this.showLocalDonors(this.id);
    });

    this.on("remove-request-donor", (d, e) => {
      let g = e.split(",");
      this.rmDonor(this.id, g[0], g[1]);
    });

    this.on("check-donors", (d, e) => {
      this.check(this.id, e);
    });
  }

  setColumns() {
    return [
      {
        data: null,
        render: data => {
          if (this.isValidDonorLocal(this.id, data._id)) {
            return `<input type="checkbox" id="${data._id}" checked onchange="$('.dTable').trigger('check-donors', '${data._id}')">`;
          } else {
            return `<input type="checkbox" id="${data._id}" onchange="$('.dTable').trigger('check-donors', '${data._id}')">`;
          }
        }
      },
      {
        data: "name"
      },
      {
        data: "phone"
      },
      {
        data: "address"
      },
      {
        data: "gender"
      },
      {
        data: null,
        render: d => {
          return d.blood_group ? d.blood_group : "N/A";
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
        class: "text-center",
        render: function (data, type, full, meta) {
          return `<a onclick="$('#frmDonorHistoryAdd').trigger('open-rating-modal', '${data._id},${data.name}')" id="rateDonors"  title='Rate Donors'>
                  <i class='btn btn-primary btn-xs fa fa-star user-icon'></i></a>`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  isValidDonorLocal(request_id, donor_id) {
    let isValid = false;

    var retrievedObject = localStorage.getItem("donor" + request_id);
    if (retrievedObject) {
      var donors = JSON.parse(retrievedObject);
      for (var d of donors) {
        if (d == donor_id) {
          isValid = true;
        }
      }
    }

    return isValid;
  }

  getDonorLocal(request_id) {
    let donors = [];
    var retrievedObject = localStorage.getItem("donor" + request_id);
    if (retrievedObject) {
      donors = JSON.parse(retrievedObject);
    }
    return donors;
  }

  check(id, donor_id) {
    var checked = document.getElementById(donor_id).checked;
    if (checked) {
      this.setDonorLocal(id, donor_id);
    } else {
      this.removeDonorLocal(id, donor_id);
    }
  }

  async showLocalDonors(id) {
    let donorIds = this.getDonorLocal(id);
    let totalDonors = "";
    var i = 0;
    for (var d of donorIds) {
      let resData = await Service.getDonors(d);
      if (!resData) return;
      totalDonors += `<tr>
                  <td>${i + 1}</td>
                  <td>${resData.name}</td>
                  <td>${resData.phone}</td>
                  <td class="text-navy hide">${resData.gender}</td>
                  <td>${resData.blood_info.group
          ? `${resData.blood_info.group}${resData.blood_info.rh_factor}`
          : "N/A"
        }</td>
                  <td class="hide" >${resData.address}</td>
                  <td> <button class="btn btn-danger"
                  onclick="$('.dTable').trigger('remove-request-donor','${resData._id},${i}')">
                  <i class="fa fa-trash"></i>
                  </button></td>
                </tr>`;

      i++;
    }
    this.addDonors(id);
    $("#donorView").html(totalDonors);
  }

  removeDonorLocal(request_id, donor_id) {
    var retrievedObject = localStorage.getItem("donor" + request_id);
    if (retrievedObject) {
      var donors = JSON.parse(retrievedObject);
      for (var i = 0; i < donors.length; i++) {
        if (donors[i] == donor_id) {
          donors.splice(i, 1);
          i--;
        }
      }

      localStorage.setItem("donor" + request_id, JSON.stringify(donors));
    }
  }

  setDonorLocal(request_id, donor_id) {
    let donors = [];
    var retrievedObject = localStorage.getItem("donor" + request_id);

    retrievedObject = JSON.parse(retrievedObject);
    if (retrievedObject && retrievedObject.length > 0) {
      retrievedObject.push(donor_id);
      donors = retrievedObject;
    } else {
      donors.push(donor_id);
    }

    localStorage.setItem("donor" + request_id, JSON.stringify(donors));
  }

  async rmDonor(id, donor_id, i) {
    $("#mdlRequestView").modal("hide");
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    try {
      if (isConfirm.value) {
        await Service.removeDonor(id, donor_id);
        $("table.copy tbody tr")[i].style.display = "none";
        $("#mdlRequestView").modal("show");
      } else $("#mdlRequestView").modal("show");
    } catch (e) {
      console.log(e.message);
    }
  }

  async addDonors(request_id) {
    let donors = this.getDonorLocal(request_id);
    if (donors.length) {
      let resData = await Service.addDonorRequest(request_id, { donor: donors, type: "donor" });
      if (!resData) return;
    } else {
      Notify.error("You must choose atleast one donor to save");
    }
  }

  async loadData(id) {
    let [data] = await Service.getDonorsLocal(id);
    if (data && data.donor) {
      localStorage.removeItem("donor" + id);
      localStorage.setItem("donor" + id, JSON.stringify(data.donor));
    }
  }
}

export default DispatchTable;
