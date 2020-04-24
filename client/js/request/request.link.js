import { Modal, Form, Session } from "rumsan-ui";
import Service from "./service";
import config from "../config";

class RequestLink extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
    this.target = cfg.target;
    this.requestId = cfg.reqId;
    this.registerEvents("request-link-added");
    this.form = new Form({
      target: this.formId,
      onSubmit: () => {
        this.requestLink(this.requestId);
      }
    });
  }

  async loadUserList() {
    this.userSelect = $("#selectjs").select2({
      dropdownParent: $(`${this.target} .modal-header`),
      width: "100%",
      placeholder: "Search a user to add...",
      minimumInputLength: 2,
      ajax: {
        url: `${config.apiPath}/requests/${this.requestId}/user`,
        headers: Session.getToken(),
        dataType: "json",
        delay: 250,
        headers: Session.getToken(),
        type: "GET",
        data: function (params) {
          var query = {
            name: params.term,
            page: params.page || 1,
            limit: 10
          };
          return query;
        },
        processResults: function (data) {
          let results = _.map(data.data, d => {
            d.id = d._id;
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

  async requestLink(reqId) {
    let data = this.form.get();
    let linkId = data._id;
    delete data._id;
    let resData = null;
    if (linkId) {
      resData = await Service.updateRequestLink(reqId, linkId, data);
    } else resData = resData = await Service.addRequestLink(reqId, data);
    if (!resData) return;
    this.form.clear();
    this.fire("request-link-added", resData);
    this.close();
  }

  openEditModal(id) {
    this.open();
    this.loadData(id);
  }

  async loadData(id) {
    let resData = await Service.getRequestLink(id);
    $(`#selectjs`).val(resData.created_for);
    $(`#selectjs`)
      .append(new Option(resData.created_for, resData.created_for, true, true))
      .trigger("change");
    this.form.set(resData);
  }
}

export default RequestLink;
