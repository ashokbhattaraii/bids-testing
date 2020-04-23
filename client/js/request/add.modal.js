import { Modal, Form, Session } from "rumsan-ui";
import Service from "./service";
import Utils from "../utils";
import config from "../config";

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
    this.renderHospitalSelector();
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

  async renderHospitalSelector() {
    $(`${this.target} [id=hospitals_list]`).select2({
      dropdownParent: $(`${this.target} .modal-header`),
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
