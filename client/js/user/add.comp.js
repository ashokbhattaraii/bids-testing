import config from "../config";
import { Modal, Form, Session } from "rumsan-ui";
import Service from "./service";

class UserAdd extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.registerEvents("generate-password", "user-added");
    this.renderRoleSelector();

    this.on("generate-password", async (event, data) => {
      this.generatePassword();
    });

    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.addUser();
      }
    });
  }

  renderRoleSelector() {
    $(`${this.target} form [name=roles]`).select2({
      dropdownParent: $(`${this.target} .modal-header`),
      width: "100%",
      minimumInputLength: 2,
      placeholder: "Search for a role",
      ajax: {
        url: `${config.apiPath}/roles`,
        headers: { access_token: Cookies.get("access_token") },
        dataType: "json",
        data: function (params) {
          var query = {
            search: params.term,
            limit: 5
          };
          return query;
        },
        processResults: data => {
          data = _.map(data.data, d => {
            d.id = d.name;
            return d;
          });
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
            <div class="col text-left">${data.name}</div>
          </div>`;
        return markup;
      },
      templateSelection: data => {
        return data.name || data.text;
      }
    });
  }

  async addUser() {
    let data = this.form.get();
    let resData = await Service.add(data);
    if (!resData) return;

    this.fire("user-added", resData);
    this.form.clear();
    this.close();
  }

  generatePassword() {
    let string_length = 8;
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%#@&!";
    let randomstring = "";

    for (let i = 0; i < string_length; i++)
      randomstring += possible.charAt(Math.floor(Math.random() * possible.length));

    $(`${this.target} [name=password]`).val(randomstring);
  }
}

export default UserAdd;
