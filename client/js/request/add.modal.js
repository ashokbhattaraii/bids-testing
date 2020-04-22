import { Modal, Form } from "rumsan-ui";
import Service from "./service";
import Utils from "../utils";

var validations = [
  {
    name: "requester_name",
    rules: [
      {
        name: "required",
        message: "field is required"
      }
    ]
  }
];

let req_products = [];

class RequestAdd extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("request-added", "blood-type-select");
    this.getHospitalList();
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.addRequest();
      }
    });

    this.on("blood-type-select", (d, val) => {
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
    });
  }

  async getHospitalList() {
    let resData = await Service.getHospitals();
    let hospitals = "";
    for (var i = 0; i < resData.data.length; i++) {
      hospitals += `<option value="${resData.data[i].name}">${resData.data[i].name}</option>`;
    }

    $(".select2").select2({
      width: "100%",
      ajax: {
        url: "/api/v1/roles",
        headers: rs.session.getToken(),
        dataType: "json",
        placeholder: "Available roles for user",
        data: function(params) {
          var query = {
            search: {
              value: params.term
            },
            limit: 100
          };
          return query;
        },
        processResults: data => {
          data = data.data;
          let userRole = data.map(d => {
            return d.name;
          });
          data = _.map(data, d => {
            return {
              id: d._id,
              role: d.name
            };
          });
          userRole = userRole.filter(n => !this.currentUserRoles.includes(n));
          if (userRole.length > 0) {
            userRole = userRole.map(u => {
              return {
                id: "sdas",
                role: u
              };
            });
          }
          data = userRole;
          return {
            results: data
          };
        },
        cache: true
      },
      escapeMarkup: markup => {
        return markup;
      },
      templateResult: data => {
        if (data.loading) {
          return data.text;
        }
        var markup = `<div class="row" style="max-width:98%">
              <div class="col text-left">${data.role}</div>
          </div>`;

        return markup;
      },
      templateSelection: data => {
        if (data.id === "") {
          return "No default roles available in system";
        } else {
          // me.addRole(data.role)
          if (!me.proccessing) {
            me.proccessing = true;
            me.addRole(data.role, () => {
              me.proccessing = false;
            });
            return "Available roles for user";
          }
        }
      }
    });

    $("#hospitals_list").html(hospitals);
  }

  async addRequest() {
    let data = this.form.get();
    data.blood_group = Utils.splitBlood(data.blood).group;
    data.rh_factor = Utils.splitBlood(data.blood).rh_factor;
    data.requested_products = req_products;
    let resData = await Service.add(data);
    this.fire("request-added", resData);
    this.form.clear();
    this.close();
  }

  toggleQuantity(is_checked, blood_type) {
    if (is_checked) {
      $("#" + blood_type).css("display", "");
    } else {
      $("#" + blood_type).css("display", "none");
    }
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
}

export default RequestAdd;
