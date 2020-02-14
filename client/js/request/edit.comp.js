import { Component, Form } from "rumsan-ui";
import Service from "./service";

let req_products = [];

class UserEdit extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.requestId = cfg.requestId;
    this.form = new Form({
      target: this.formId
    });
    this.loadData(this.requestId);
    this.setDonorsView(this.requestId);
  }

  async loadData(requestId) {
    let data = await Service.get(requestId);
    this.setComponents(data.requested_products);
    this.form.set(data);
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

  async setDonorsView(id) {
    let d = await Service.getDonorsLocal(id);
    if (!d) return;
    console.log(d);

    let donors = d
      .map((d, i) => {
        d = d.donor;
        return `<tr>
                  <td>${i + 1}</td>
                  <td>${d.name}</td>
                  <td>${d.phone}</td>
                  <td class="text-navy hide">${d.gender}</td>
                  <td>${
                    d.blood_info.group ? `${d.blood_info.group}${d.blood_info.rh_factor}` : "N/A"
                  }</td>
                  <td>
                    <button class="btn btn-danger" onclick="removeDonor('${id}','${d._id}')">
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>`;
      })
      .join(" ");

    $("#donorView").html(donors);
  }
}

export default UserEdit;
