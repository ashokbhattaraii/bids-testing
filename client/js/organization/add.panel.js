import { Component, Form } from "rumsan-ui";
import Service from "./service";

class OrganizationAdd extends Component {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("org-added");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.addOrganization();
      }
    });

    this.on("org-added", (d, e) => {
      this.form.clear();
      this.close();
    });
  }

  async addOrganization() {
    let data = this.form.get();
    let resData = await Service.addOrganization(data);
    this.fire("org-added", resData);
  }

  // toggleQuantity(is_checked, blood_type) {
  //   if (is_checked) {
  //     $("#" + blood_type).css("display", "");
  //   } else {
  //     $("#" + blood_type).css("display", "none");
  //   }
  // }

  // _product(blood_type) {
  //   let qty = parseInt($("#" + blood_type).val());
  //   if (qty > 0) {
  //     let obj = {
  //       blood_type: blood_type,
  //       quantity: qty
  //     };
  //     return obj;
  //   } else {
  //     return null;
  //   }
  // }
}

export default OrganizationAdd;
