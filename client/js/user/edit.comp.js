import config from "../config";
import { Component } from "../core";
import Service from "./service";

class UserEdit extends Component {
  async loadData(userId) {
    let data = await Service.get(userId);
    data.name = data.name.full;
    Form.set(this.target, data, "name,email,phone,gender,dob");
    //this.currentUserRoles = data.roles;
    //this.createUserRolesTable(data.roles);
  }
}

export default UserEdit;
