import { Component, Form, Notify, Session } from "rumsan-ui";
import Service from "./service";
import config from "../config";
import Utils from "../utils";

let req_products = [];

class UserEdit extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.requestId = cfg.requestId;
    this.request_type = cfg.requestType;
    this.renderHospitalSelector();
    this.registerEvents(
      "remove-req-donor",
      "toggle-req-donor-feedback-modal",
      "remove-req-organization",
      "copy-text",
      "add-managedComponents-field",
      "show-component-manage-div",
      "remove-manage-component-div",
      "add-donor-feedback"
    );
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.editRequest(this.requestId);
      }
    });

    this.donorFeedbackForm = new Form({
      target: `#donorRemarksForm`,
      onSubmit: () => {
        this.addRequestedDonorFeedback();
      }
    });

    this.on("copy-text", (d, e) => {
      Utils.copyText(e);
    });

    this.on("toggle-req-donor-feedback-modal", (e, d) => {
      this.toggleRequestedDonorRemarkModal();
      $("#donorId").val(d.donor_id);
    });

    this.on("remove-manage-component-div", (e, d) => {
      this.removeManagedComponents(d);
    });

    this.on("add-managedComponents-field", (d, e) => {
      this.appendManageComponents(e);
    });

    this.on("show-component-manage-div", (d, e) => {
      this.showComponentManageDiv();
    });

    this.loadData(this.requestId, this.request_type);
  }

  toggleRequestedDonorRemarkModal() {
    $("#donorRemarksForm").modal("toggle");
  }

  async removeManagedComponents(d) {
    $(`#allTypeFields${d.i}`).remove();
    let resData = await Service.removeManagedComponents(this.requestId, d.type);
    this.loadData(this.requestId);
  }

  async addRequestedDonorFeedback(donorId) {
    let data = this.donorFeedbackForm.get();
    let resData = await Service.addRequestedDonorFeedback(this.requestId, data);
    if (!resData) {
      Notify.error("Something went wrong. Try again Later.");
    } else {
      this.toggleRequestedDonorRemarkModal();
      Notify.show("Successfully added the Feedback.");
    }
  }

  async showComponentManageDiv() {
    if ($("#requestStatus").val() === "managed") {
      $("#manageComponentDiv").removeAttr("style");
    } else {
      $("#manageComponentDiv").attr("style", "display:none;");
    }
  }

  async appendManageComponents() {
    let sum = $(".allTypeFields").length;
    let contents = ` <div class="form-row allTypeFields" style="width: 100%;" id="allTypeFields${
      sum + 1
    }">
    <div class="col-md-4">
    <select class="form-control" name="blood_type${
      sum + 1
    }" data-validation="required" data-group="managed_products">
    <option selected>--Select Blood Type--</option>
    <option selected value="PRBC">PRBC</option>
    <option value="FFP">FFP</option>
    <option value="PRP">PRP</option>
    <option value="WB">WB</option>
    <option value="CRY">CRY</option>
    <option value="PC">PC</option>
    </select>
  </div>
  <div class="col-md-3">
    <input type="number" class="form-control" id="PRBC" name="quantity${sum + 1}"
      placeholder="Enter qty." data-group="managed_products"/>
  </div>
  <div class="col-md-4">
    <input type="text" class="form-control" id="manager" name="manager${sum + 1}"
      placeholder="Enter organization/donor." data-group="managed_products"/>
  </div>
  <div class="col-md-1">
  <span class="close" onclick="$('#frmRequestEdit').trigger('remove-manage-component-div',{i: '${
    sum + 1
  }'})">&times;</span>
  </div>
  </div>`;

    $("#managedComponents").append(contents);
  }

  async loadData(requestId) {
    let data = await Service.get(requestId);
    if (data) {
      console.log(data.pledge[0]);
      data.blood = data.blood_group + data.rh_factor;
      data.requested_date = moment(data.requested_date).format("YYYY-MM-DD");
      this.setComponents(data.requested_products);
      if (data.status === "managed" && data.managed_products)
        this.setManagedComponents(data.managed_products);
      $(`#select2-hospitals_list-container`).text(data.hospital);
      $(`${this.target} [id=hospitals_list]`)
        .append(new Option(data.hospital, data.hospital, true, true))
        .trigger("change");
      this.form.set(data);
      $("#requisition_form_preview").attr("src", `${data.requisition_file_url}`);
      $("#req_form_link").attr("href", `${data.requisition_file_url}`);

      if (data.additional_donors.length > 0) {
        this.setAdditionalDonors(data.additional_donors);
      }
      this.setOrganizationsView(this.requestId);
      this.setDonorsView(this.requestId);

      data.pledge.forEach((el, i) => {
        $("#pledgeAppend").append(`      
              <tr>
                <th>${i + 1}</th>
                <td>${el.name}</td>
                <td>${el.address}</td>
                <td>${el.contact}</td>
              </tr>
      `);
      });
    }
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
      minimumInputLength: 0,
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

  setManagedComponents(data) {
    let managed_products = ``;
    if (data.length == 1) {
      managed_products = `<div class="form-row allTypeFields" style="width: 100%;" id="allTypeFields1">
        <div class="col-md-4">
        <select class="form-control" name="blood_type1" id="blood_type1" data-validation="required" data-group="managed_products">
        <option value="PRBC">PRBC</option>
        <option value="FFP">FFP</option>
        <option value="PRP">PRP</option>
        <option value="WB">WB</option>
        <option value="CRY">CRY</option>
        <option value="PC">PC</option>
        </select>
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control" id="PRBC1" name="quantity1"
          placeholder="Enter qty." value="${data[0].quantity}" data-group="managed_products"/>
      </div>
      <div class="col-md-4">
        <input type="text" class="form-control" id="manager1" name="manager1"
          placeholder="Enter organization/donor." value="${data[0].manager}" data-group="managed_products"/>
      </div>
      <div class="col-md-1">
      <span class="close" onclick="$('#frmRequestEdit').trigger('remove-manage-component-div',{i: '1',type:'${data[0].blood_type}'})">&times;</span>
      </div>
      </div>`;
      // (`#blood_type1`).val(data[0].blood_type).change()
    } else {
      for (let i = 1; i <= data.length; i++) {
        managed_products += `<div class="form-row allTypeFields" style="width: 100%;" id="allTypeFields${i}">
        <div class="col-md-4">
        <select class="form-control" name="blood_type${i}" id="blood_type${i}" data-validation="required" data-group="managed_products">
        <option value="PRBC">PRBC</option>
        <option value="FFP">FFP</option>
        <option value="PRP">PRP</option>
        <option value="WB">WB</option>
        <option value="CRY">CRY</option>
        <option value="PC">PC</option>
        </select>
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control" id="PRBC${i}" name="quantity${i}"
          placeholder="Enter qty." value="${data[i - 1].quantity}" data-group="managed_products"/>
      </div>
      <div class="col-md-4">
        <input type="text" class="form-control" id="manager${i}" name="manager${i}"
          placeholder="Enter organization/donor." value="${
            data[i - 1].manager
          }" data-group="managed_products"/>
      </div>
      <div class="col-md-1">
      <span class="close" onclick="$('#frmRequestEdit').trigger('remove-manage-component-div',{i: '${i}',type:'${
          data[i - 1].blood_type
        }'})">&times;</span>
      </div>
      </div>`;
      }
    }

    $(`#manageComponentDiv`).removeAttr("style");
    $(`#managedComponents`).html(managed_products);
    for (let i = 1; i <= data.length; i++) {
      $(`#blood_type${i}`)
        .val(`${data[i - 1].blood_type}`)
        .change();
    }
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
                    <td> 
                    <button class="btn btn-danger" 
                    onclick="$('#frmRequestEdit').trigger('remove-req-donor','${id},${
            resData._id
          },${i}')"><i class="fa fa-trash"></i></button>
                    <button class="btn btn-success" 
                    onclick="$('#frmRequestEdit').trigger('toggle-req-donor-feedback-modal',{request_id:'${id}',donor_id:'${
            resData._id
          }',i:'${i}'})">
                    <i class="fa fa-star"></i>
                    </button>
                    </td>
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

    let total = $(".allTypeFields").length;
    const managed_products = [];
    for (let i = 1; i <= Number(total); i++) {
      let data_collection = {};
      data_collection.blood_type = data.managed_products[`blood_type${i}`];
      data_collection.quantity = data.managed_products[`quantity${i}`];
      data_collection.manager = data.managed_products[`manager${i}`];
      managed_products.push(data_collection);
    }
    data.managed_products = managed_products;
    data.blood_group = Utils.splitBlood(data.blood).group;
    data.rh_factor = Utils.splitBlood(data.blood).rh_factor;
    let resData = await Service.editRequest(id, data);
    if (!resData) return;
    window.location.href = "/requests";
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
        $("table.orgList tbody tr")[i].style.display = "none";
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default UserEdit;
