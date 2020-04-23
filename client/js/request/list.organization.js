import config from "../config";
import { TablePanel } from "rumsan-ui";
import Service from "./service";

class OrganizationTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/requests/organization/${cfg.id}`;
    super(cfg);
    this.id = cfg.id;
    this.render();
    this.registerEvents("show-local-org", "check-organizations", "add-donor");

    this.on("show-local-org", (d, e) => {
      this.showOrganizationDonors(this.id);
    });

    this.on("check-organizations", (d, e) => {
      this.check(this.id, e);
    });
  }

  setColumns() {
    return [
      {
        data: null,
        render: data => {
          if (this.isValidOrganizationLocal(this.id, data._id)) {
            return `<input type="checkbox" id="${data._id}" checked onchange="$('.oTable').trigger('check-organizations', '${data._id}')">`;
          } else {
            return `<input type="checkbox" id="${data._id}" onchange="$('.oTable').trigger('check-organizations', '${data._id}')">`;
          }
        }
      },
      {
        data: "name"
      },
      {
        data: "phone"
      },
      {
        data: "address"
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  isValidOrganizationLocal(request_id, org_id) {
    let isValid = false;

    var retrievedObject = localStorage.getItem("organization" + request_id);
    if (retrievedObject) {
      var organizations = JSON.parse(retrievedObject);
      for (var d of organizations) {
        if (d == org_id) {
          isValid = true;
        }
      }
    }

    return isValid;
  }

  getOrganizationLocal(request_id) {
    let organizations = [];
    var retrievedObject = localStorage.getItem("organization" + request_id);
    if (retrievedObject) {
      organizations = JSON.parse(retrievedObject);
    }
    return organizations;
  }

  check(id, org_id) {
    var checked = document.getElementById(org_id).checked;
    if (checked) {
      this.setOrganizationLocal(id, org_id);
    } else {
      this.removeOrganizationLocal(id, org_id);
    }
  }

  async showOrganizationDonors(id) {
    let orgIds = this.getOrganizationLocal(id);
    let totalOrganizations = "";
    var i = 0;
    for (var d of orgIds) {
      let resData = await Service.getOrganizations(d);
      if (!resData) return;
      totalOrganizations += `<tr>
                  <td>${i + 1}</td>
                  <td>${resData.name}</td>
                  <td>${resData.phone}</td>
                  <td class="hide" >${resData.address}</td>
                  <td> <button class="btn btn-danger"
                  onclick="$('.dTable').trigger('remove-request-donor','${resData._id},${i}')">
                  <i class="fa fa-trash"></i>
                  </button></td>
                </tr>`;

      i++;
    }
    this.addOrganizations(id);
    $("#orgView").html(totalOrganizations);
  }

  removeOrganizationLocal(request_id, org_id) {
    var retrievedObject = localStorage.getItem("organization" + request_id);
    if (retrievedObject) {
      var organizations = JSON.parse(retrievedObject);
      for (var i = 0; i < organizations.length; i++) {
        if (organizations[i] == org_id) {
          organizations.splice(i, 1);
          i--;
        }
      }

      localStorage.setItem("organization" + request_id, JSON.stringify(organizations));
    }
  }

  setOrganizationLocal(request_id, org_id) {
    let organizations = [];
    var retrievedObject = localStorage.getItem("organization" + request_id);

    retrievedObject = JSON.parse(retrievedObject);
    if (retrievedObject && retrievedObject.length > 0) {
      retrievedObject.push(org_id);
      organizations = retrievedObject;
    } else {
      organizations.push(org_id);
    }

    localStorage.setItem("organization" + request_id, JSON.stringify(organizations));
  }

  async rmDonor(id, donor_id, i) {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    try {
      if (isConfirm.value) {
        await Service.removeDonor(id, donor_id);
        $("table.copy tbody tr")[i].style.display = "none";
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  async addOrganizations(request_id) {
    let organizations = this.getOrganizationLocal(request_id);
    let resData = await Service.addDonorRequest(request_id, {
      organization: organizations,
      type: "organization"
    });
    if (!resData) return;
  }
}

export default OrganizationTable;
