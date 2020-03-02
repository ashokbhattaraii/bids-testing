import { Component, Form } from "rumsan-ui";
import Service from "./service";

let req_products = [];

class UserEdit extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.requestId = cfg.requestId;
    this.request_type = cfg.requestType;
    this.registerEvents("remove-req-donor", "remove-req-organization");
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
    this.setComponents(data.requested_products);
    this.form.set(data);
    this.setOrganizationsView(this.requestId);
    this.setDonorsView(this.requestId);
  }

  getRequestedBloodType() {
    var me = this;
    $("input:checkbox.req-products").each(function() {
      let val = this.checked ? $(this).val() : "";
      if (val) {
        let data = me._product(val);
        if (data) {
          req_products.push(data);
        }
      }
    });
  }

  setComponents(data) {
    let inputCheckValue = [];
    var a = 0;
    $("input:checkbox.req-products").each(function() {
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

  async setOrganizationsView(id) {
    let dIds = this.getDispatchDonorIds(id);
    let totalOrganizations = "";
    var i = 0;
    dIds.then(async val => {
      for (var a of val) {
        for (var j = 0; j < a.organization.length; j++) {
          let resData = await Service.getOrganizaitons(a.organization[j]);
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
        $("table.copy tbody tr")[i].style.display = "none";
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
        console.log("##33333 this is the value of i", i);
        $("table.copy tbody tr")[i].style.display = "none";
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default UserEdit;
