import { Modal, Form } from "rumsan-ui";
import Service from "./service";
import config from "../config";

class RequestLink extends Modal {
  constructor(cfg) {
    super(cfg);
    this.formId = "#frm" + cfg.name;
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
      width: "100%",
      tags: true,
      multiple: true,
      tokenSeparators: [",", " "],
      minimumInputLength: 2,
      minimumResultsForSearch: 10,
      placeholder: "Search a user to add...",
      dropdownParent: `${this.target}`,
      ajax: {
        url: `${config.apiPath}/requests/${this.requestId}/user`,
        dataType: "json",
        type: "GET",
        data: function (params) {
          var query = {
            search: { value: params.term },
            page: params.page || 1,
            limit: 10
          };
          return query;
        },
        processResults: function (data) {
          return {
            results: $.map(data.data, function (obj) {
              return { id: obj._id, text: obj.name };
            })
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
          <div class="col text-left">${data.text}</div>
        </div>`;

        return markup;
      },
      templateSelection: data => {
        return data.text;
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
    $("#selectjs").val(resData.created_for).trigger("change");
    this.form.set(resData);
  }
}

export default RequestLink;
