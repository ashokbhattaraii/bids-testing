import { Component, Form } from "rumsan-ui";
import Service from "./service";

let req_products = [];

class UserEdit extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.requestId = cfg.requestId;
    this.registerEvents("remove-req-donor");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.editRequest(this.requestId);
      }
    });
    this.loadData(this.requestId);
    this.setDonorsView(this.requestId);

    this.on("remove-req-donor", (d, e) => {
      let g = e.split(",");
      this.rmDonor(g[0], g[1], g[2]);
    });
  }

  async loadData(requestId) {
    let data = await Service.get(requestId);
    this.setComponents(data.requested_products);
    this.form.set(data);
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
                    <button class="btn btn-danger" onclick="$('#frmRequestEdit').trigger('remove-req-donor','${id},${
          d._id
        },${i}')">
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>`;
      })
      .join(" ");

    $("#donorView").html(donors);
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
}

export default UserEdit;
