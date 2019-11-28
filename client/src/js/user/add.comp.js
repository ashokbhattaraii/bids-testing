import config from "../config";
import { Component } from "../core";
import Service from "./service";
import { Form, Session } from "rs-utils";
const RSForm = Form($);

class UserAdd extends Component {
  constructor(cfg) {
    super(cfg);
    this.form = $(`${cfg.target} form`);
    this.events = ["generate-password", "user-added"];

    this.renderRoleSelector();
    this.on("generate-password", async (event, data) => {
      this.generatePassword();
    });

    this.form.submit(e => {
      e.preventDefault();
      this.addUser();
    });
  }

  open() {
    $(this.target).modal("show");
  }

  close() {
    $(this.target).modal("hide");
  }

  renderRoleSelector() {
    $(`${this.target} form [name=roles]`).select2({
      dropdownParent: $(`${this.target} .modal-header`),
      width: "100%",
      minimumInputLength: 2,
      placeholder: "Search for a role",
      ajax: {
        url: `${config.apiPath}/roles`,
        headers: Session.getToken(),
        dataType: "json",
        data: function(params) {
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
    if (!this.comp.validate()) return;
    let data = RSForm.get(`${this.target} form`);

    let resData = await Service.add(data);
    if (!resData) return;

    this.fire("user-added", resData);
    RSForm.clear(this.form);
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
