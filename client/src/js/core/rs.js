export default {
  form: {
    getData: $form => {
      var unindexed_array = $form.serializeArray();
      var indexed_array = {};

      $.map(unindexed_array, function(n, i) {
        indexed_array[n["name"]] = n["value"];
      });

      return indexed_array;
    },

    get: form => {
      var data = {};
      $(`${form} :input`).each(function() {
        if (!this.name) return;
        let value = this.value;
        if (this.type == "checkbox") {
          value = this.checked;
        }
        if (this.type == "radio") {
          value = $(`input[name="${this.name}"]:checked`).val();
        }
        if (this.type == "select") {
          value = $(`select[name="${this.name}"]`).val();
        }
        let group = $(this).data("group");
        if (group) {
          data[group] = {
            ...data[group],
            ...{
              [this.name]: value
            }
          };
        } else {
          data[this.name] = value;
        }
      });
      return data;
    },

    set: (form, data, fields) => {
      if (!fields) {
        console.error("Must send field list of fill");
        return;
      }
      fields = fields.split(",");
      fields.forEach(f => {
        $(`${form} input[name=${f}]`).val(data[f]);
        $(`${form} select[name=${f}]`).val(data[f]);
        $(`${form} textarea[name=${f}]`).val(data[f]);
      });
    },

    clear: form => {
      $(":input", form)
        .not(":button, :submit, :reset")
        .val("")
        .prop("checked", false)
        .prop("selected", false);
    }
  },

  session: {
    getToken: () => {
      return { access_token: Cookies.get("access_token") };
    },
    getUser: () => {
      let userStr = Cookies.get("user");
      if (userStr) return JSON.parse(userStr);
      else return {};
    }
  },

  permissions: {
    list: () => {
      let permissions = Cookies.get("permissions");
      if (permissions) return JSON.parse(permissions);
      else return {};
    },
    has: (perms = []) => {
      let arrayContainsArray = (superset, subset) => {
        if (0 === subset.length || superset.length < subset.length) {
          return false;
        }
        for (var i = 0; i < subset.length; i++) {
          if (superset.indexOf(subset[i]) > -1) return true;
        }
        return false;
      };

      try {
        if (typeof perms == "string") perms = perms.split(",");
        let permissions = Cookies.get("permissions");
        if (!permissions) return false;
        permissions = JSON.parse(permissions);
        return arrayContainsArray(permissions, perms);
      } catch (e) {
        return false;
      }
    }
  },

  dataTables: {
    setConfig: config => {
      let newConfig = Object.assign({}, config);
      const defaultAjaxConfig = {
        dataFilter: data => {
          let json = JSON.parse(data);
          json.recordsTotal = json.total;
          json.recordsFiltered = json.total;
          return JSON.stringify(json); // return JSON string
        },
        data: function(d) {
          return $.extend({}, { start: d.start, limit: d.length, search: d.search });
        }
      };

      if (newConfig.ajax) newConfig.ajax = Object.assign(defaultAjaxConfig, newConfig.ajax);

      const defaultCfg = {
        pageLength: 25,
        processing: true,
        responsive: true,
        filter: true,
        sort: false,
        serverSide: true,
        searchDelay: 500,
        dom:
          "<'row'<'col-sm-8'<'float-left'f>><'col-sm-4'<'float-right p-2'l>>>" +
          "<'row'<'col-sm-12'tr>>" +
          "<'row'<'col-sm-4'i><'col-sm-8'<'float-right p-2'p>>>"
      };

      return Object.assign(defaultCfg, newConfig);
    }
  }
};
