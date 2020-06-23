import { Modal, Form } from "rumsan-ui";
import Service from "./service";

class AddEmployee extends Modal {
  constructor(cfg) {
    super(cfg);
    this.name = cfg.name;
    this.modalId = "#mdl" + cfg.name;
    this.formId = "#frm" + cfg.name;
    this.org_id = cfg.organizationId || null;
    this.registerEvents("employee-added", "employee-removed");

    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.save();
      }
    });

    $(`${this.formId} [name = btnCancel]`).on("click", e => {
      this.close();
    });
  }

  openEmployeeModal(val) {
    this.open();
    this.loadEmployeeDetail(val);
  }

  async save() {
    let data = this.form.get();
    let resData = await Service.addEmployee(data, this.org_id);
    this.fire("employee-added", resData);
  }

  async loadEmployeeDetail(value) {
    let data = await Service.getEmployeeDetail(value.org_id, value.id);
    data.name = data.name.first + " " + data.name.last;

    this.form.set(data);
  }

  async removeEmp(id) {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You will remove this Employee permanently.",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    });
    if (isConfirm.value) {
      let data = await Service.removeUser(id);
      if (!data) return;
      this.fire("employee-removed");
    }
  }

  // changeUserStatus(user_id, e) {
  //   let is_active = e.checked;
  //   let url = `/api/v1/users/${user_id}/status`;
  //   if (this.org_id) url = `/api/v1/organizations/employee/${user_id}/status`;
  //   swal(
  //     {
  //       title: "Are you sure?",
  //       text: "You are changing status of the user.",
  //       type: "warning",
  //       showCancelButton: true
  //     },
  //     function (isConfirm) {
  //       if (isConfirm) {
  //         $.ajax({
  //           url,
  //           method: "POST",
  //           headers: { access_token: $.cookie("access_token") },
  //           data: { is_active }
  //         });
  //       } else {
  //         e.checked = !e.checked;
  //       }
  //     }
  //   );
  // }
}

export default AddEmployee;
