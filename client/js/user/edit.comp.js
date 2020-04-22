import { Component, Form } from "rumsan-ui";
import Service from "./service";

class UserEdit extends Component {
  constructor(cfg) {
    super(cfg);
    this.registerEvents("save", "data-load");
    this.userId = cfg.user_id;
    this.form = new Form({
      target: `${cfg.target} form`,
      onSubmit: () => {
        this.save();
      }
    });
    this.loadData(this.userId);
  }

  async loadData(userId) {
    this.data = await Service.get(userId);
    console.log("&&&&&&&&&&&& data", this.data);
    this.form.set(
      Object.assign({}, this.data, {
        name: this.data.name.full,
        dob: this.data.dob ? moment(this.data.dob).format("YYYY-MM-DD") : ""
      })
    );
    this.fire("data-load", this.data);
  }

  async save() {
    let data = this.form.get();
    await Service.save(this.data._id, data);
    this.fire("save", data);
  }
}

export default UserEdit;
