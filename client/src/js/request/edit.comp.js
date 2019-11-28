import config from "../config";
import { Component } from "../core";
import Service from "./service";
import { Form } from "rs-utils";
const RSForm = Form($);

class UserEdit extends Component {
  async loadData(userId) {
    let data = await Service.get(userId);
    data.name = data.name.full;
    RSForm.set(this.target, data, "name,email,phone,gender,dob");
    //this.currentUserRoles = data.roles;
    //this.createUserRolesTable(data.roles);
  }
}

export default UserEdit;
