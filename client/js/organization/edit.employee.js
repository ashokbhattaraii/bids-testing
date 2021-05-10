import { Component, Form, Notify } from "rumsan-ui";
import Service from "./service";

class UserDetails extends Component {
  constructor(cfg) {
    super(cfg);
    this.emp_id = cfg.emp_id;
    this.rtable = cfg.rTable;
    this.currentUserRoles = [];
    this.formId = "#frm" + cfg.name;
    this.proccessing = false;
    this.baseUrl = cfg.baseUrl;

    this.registerEvents("role-added", "delete-role", "role-deleted");

    this.form = new Form({
      target: this.formId,
      onSubmit: e => {
        e.preventDefault();
        this.updateUser();
      }
    });

    this.on("delete-role", (d, e) => {
      this.removeRole(e);
    });

    this.on("role-deleted", (d, e) => {
      this.rtable.clear();
      this.rtable.destroy();
      this.loadUserData();
    });

    this.load();
  }

  async addRole(value, cb) {
    let data = {
      roles: value
    };

    let resData = await Service.addRole(this.emp_id, data);

    this.rtable.clear();
    this.rtable.destroy();
    this.loadUserData();
    if (cb) cb();
    $(".select2").empty().trigger("change");
    this.listAvailableRoles();
  }

  createUserRolesTable(roles) {
    this.rtable = $(".rTable").DataTable({
      pageLength: 5,
      sort: false,
      dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-4'i><'col-sm-8'<'float-right p-2'p>>>",
      columns: [
        {
          title: "Roles"
        },
        {
          title: "Action",
          data: null,
          render: data => {
            return `<button class= "btn btn-danger btn-xs" onclick="$('#frmEditUser').trigger('delete-role','${data}')"><i class="fa fa-trash"></i></button>`;
          }
        }
      ]
    });
    this.loadRolesTable(roles);
  }

  listAvailableRoles() {
    var me = this;

    $(".select2").select2({
      width: "100%",
      ajax: {
        url: "/api/v1/roles",
        headers: { access_token: Cookies.get("access_token") },
        dataType: "json",
        placeholder: "Available roles for user",
        data: function (params) {
          var query = {
            search: {
              value: params.term
            },
            limit: 100
          };
          return query;
        },
        processResults: data => {
          data = data.data;
          let userRole = data.map(d => {
            return d.name;
          });
          data = _.map(data, d => {
            return {
              id: d._id,
              role: d.name
            };
          });
          userRole = userRole.filter(n => !this.currentUserRoles.includes(n));
          if (userRole.length > 0) {
            userRole = userRole.map(u => {
              return {
                id: "sdas",
                role: u
              };
            });
          }
          data = userRole;
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
              <div class="col text-left">${data.role}</div>
          </div>`;

        return markup;
      },
      templateSelection: data => {
        if (data.id === "") {
          return "No default roles available in system";
        } else {
          // me.addRole(data.role)
          if (!me.proccessing) {
            me.proccessing = true;
            me.addRole(data.role, () => {
              me.proccessing = false;
            });
            return "Available roles for user";
          }
        }
      }
    });
  }

  load() {
    this.loadUserData();
    this.listAvailableRoles();
    //this.setUserDetails();
  }

  loadRolesTable(roles) {
    roles.forEach(r => {
      this.rtable.row.add([r]);
    });
    this.rtable.draw();
  }

  async loadUserData() {
    let data = await Service.getEmployeeDetail(this.emp_id);

    this.form.set(data);
    $("#name").val(data.name.full);

    this.currentUserRoles = data.roles;
    this.createUserRolesTable(data.roles);
  }

  async removeRole(name) {
    let data = {
      role: name
    };

    let resData = await Service.removeRole(this.emp_id, data);
    this.fire("role-deleted", resData);
  }

  async updateUser() {
    let data = this.form.get();

    let resData = await Service.updateUser(this.emp_id, data);
    if (!resData) return;

    this.rtable.clear();
    this.rtable.destroy();
    this.loadUserData();
    Notify.show("Employee Data updated successfully")
  }
}

export default UserDetails;
