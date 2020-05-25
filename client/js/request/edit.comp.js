import { Component, Form, Session } from "rumsan-ui";
import Service from "./service";
import config from "../config";

let req_products = [];

class UserEdit extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.requestId = cfg.requestId;
    this.request_type = cfg.requestType;
    this.renderHospitalSelector();
    this.registerEvents("remove-req-donor", "remove-req-organization", "copy-text");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.editRequest(this.requestId);
      }
    });

    this.loadData(this.requestId, this.request_type);
  }

  async loadData(requestId) {
    let data = await Service.get(requestId);
    data.blood = data.blood_group + data.rh_factor;
    data.requested_date = moment(data.requested_date).format("YYYY-MM-DD");
    this.setComponents(data.requested_products);
    $(`#select2-hospitals_list-container`).text(data.hospital);
    $(`${this.target} [id=hospitals_list]`)
      .append(new Option(data.hospital, data.hospital, true, true))
      .trigger("change");
    this.form.set(data);

    if (data.additional_donors.length > 0) {
      this.setAdditionalDonors(data.additional_donors);
    }
    this.setOrganizationsView(this.requestId);
    this.setDonorsView(this.requestId);
  }

  getRequestedBloodType() {
    var me = this;
    $("input:checkbox.req-products").each(function () {
      let val = this.checked ? $(this).val() : "";
      if (val) {
        let data = me._product(val);
        if (data) {
          req_products.push(data);
        }
      }
    });
  }

  async renderHospitalSelector() {
    $(`${this.target} [id=hospitals_list]`).select2({
      width: "100%",
      placeholder: "Select Hospital/Bloodbank",
      minimumInputLength: 2,
      ajax: {
        url: `${config.apiPath}/organizations`,
        headers: Session.getToken(),
        dataType: "json",
        delay: 250,
        data: function (params) {
          var query = {
            name: params.term
          };
          return query;
        },
        processResults: data => {
          let results = _.map(data.data, d => {
            d.id = d.name;
            d.text = d.name;
            return d;
          });
          return {
            results
          };
        },
        cache: true
      }
    });
  }

  setComponents(data) {
    let inputCheckValue = [];
    var a = 0;
    $("input:checkbox.req-products").each(function () {
      inputCheckValue.push($(this).val());
      for (a in data) {
        if (data[a].blood_type == $(this).val()) {
          $(this).attr("checked", true);
          $("#" + data[a].blood_type).css("display", "");
          parseInt($("#" + data[a].blood_type).val(data[a].quantity));
        }
      }
      a++;
    });
  }

  getDonorLocal(request_id) {
    let donors = [];
    var retrievedObject = localStorage.getItem(request_id);
    if (retrievedObject) {
      donors = JSON.parse(retrievedObject);
    }
    return donors;
  }

  async getDispatchDonorIds(id) {
    let resData = await Service.getDonorsLocal(id);
    return resData;
  }

  async setDonorsView(id) {
    let dIds = this.getDispatchDonorIds(id);
    let totalDonors = "";
    var i = 0;
    dIds.then(async val => {
      for (var a of val) {
        for (var j = 0; j < a.donor.length; j++) {
          let resData = await Service.getDonors(a.donor[j]);
          if (!resData) return;
          totalDonors += `<tr>
                    <td>${i + 1}</td>
                    <td>${resData.name}</td>
                    <td>${resData.phone}</td>
                    <td class="text-navy hide">${resData.gender}</td>
                    <td>${
                      resData.blood_info.group
                        ? `${resData.blood_info.group}${resData.blood_info.rh_factor}`
                        : "N/A"
                    }</td>
                    <td class="hide" >${resData.address}</td>
                    <td> <button class="btn btn-danger"
                    onclick="$('#frmRequestEdit').trigger('remove-req-donor','${id},${
            resData._id
          },${i}')">
                    <i class="fa fa-trash"></i>
                    </button></td>
                  </tr>`;

          i++;
        }
      }
      $("#donorView").html(totalDonors);
    });
  }

  async setAdditionalDonors(values) {
    let totalAdditionalDonors = "";
    for (var i = 0; i < values.length; i++) {
      totalAdditionalDonors += `<tr>
                    <td>${i + 1}</td>
                    <td>${values[i].name}</td>
                    <td>${values[i].phone}</td>
                    <td class="hide" >${values[i].address}</td>
                    <td class="hide" >${values[i].created_by_name}</td>
                  </tr>`;
    }
    $("#addDonorView").html(totalAdditionalDonors);
    $("#additionalDonorsViews").removeAttr("style");
  }

  async setOrganizationsView(id) {
    let dIds = this.getDispatchDonorIds(id);
    let totalOrganizations = "";
    var i = 0;
    dIds.then(async val => {
      for (var a of val) {
        for (var j = 0; j < a.organization.length; j++) {
          let resData = await Service.getOrganizations(a.organization[j]);
          if (!resData) return;
          totalOrganizations += `<tr>
                    <td>${i + 1}</td>
                    <td>${resData.name}</td>
                    <td>${resData.phone}</td>
                    <td class="hide" >${resData.address}</td>
                    <td> <button class="btn btn-danger"
                    onclick="$('#frmRequestEdit').trigger('remove-req-organization','${id},${
            resData._id
          },${i}')">
                    <i class="fa fa-trash"></i>
                    </button></td>
                  </tr>`;

          i++;
        }
      }
      $("#orgView").html(totalOrganizations);
    });
  }

  _product(blood_type) {
    let qty = parseInt($("#" + blood_type).val());
    if (qty > 0) {
      let obj = {
        blood_type: blood_type,
        quantity: qty
      };
      return obj;
    } else {
      return null;
    }
  }

  async editRequest(id) {
    let data = this.form.get();
    this.getRequestedBloodType();
    data.requested_products = req_products;
    let resData = await Service.editRequest(id, data);
    if (!resData) return;
    window.location.reload();
  }

  async rmDonor(id, donor_id, i) {
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
        $("table.donor tbody tr")[i].style.display = "none";
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  async rmOrganization(id, org_id, i) {
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
        await Service.removeOrganization(id, org_id);
        $("table.org tbody tr")[i].style.display = "none";
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default UserEdit;
