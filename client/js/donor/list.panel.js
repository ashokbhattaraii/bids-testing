import config from "../config";
import { TablePanel, Form } from "rumsan-ui";

class UserTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/donors`;
    super(cfg);
    this.render();
    this.registerEvents("open-rating-modal");
    this.donorRatingForm = new Form({
      target: `#frmDonorHistoryAdd`,
      onSubmit: () => {
        this.saveDonorHistory();
      }
    });

    // this.on("open-rating-modal", (d, e) => {
    //   const [id, name] = e.split(',');
    //   this.openRatingModal(id, name);
    // });

    

  }

  setColumns() {
    return [
      {
        data: "name"
      },
      {
        data: "phone"
      },
      {
        data: "gender"
      },

      {
        data: null,
        render: d => {
          return d.address ? d.address : "";
        }
      },
      {
        data: null,
        render: d => {
          return d.blood_info
            ? (d.blood_info.group ? d.blood_info.group : "") +
                (d.blood_info.rh_factor ? d.blood_info.rh_factor : "")
            : "";
        }
      },
      {
        data: null,
        render: d => {
          return d.status ? d.status : "";
        }
      },
      {
        data: null,
        render: data => {
          if (!data.last_contacted_date) return "";
          else return moment(data.last_contacted_date).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        render: data => {
          if (!data.last_donated_date) return "";
          else return moment(data.last_donated_date).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        render: data => {
          return data.donations_legacy ? data.donations_legacy.length : 0;
        }
      },
      {
        data: null,
        class: "text-center",
        render: function(data, type, full, meta) {
          return `<a  href="/donors/edit/${data._id}" id="editDonor" title='Edit Donor'data>
          <i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a>
          <a onclick="$('#tblDonor').trigger('open-rating-modal', '${data._id},${data.name}')" id="rateDonors"  title='Rate Donors'>
          <i class='btn btn-primary btn-xs fa fa-star user-icon'></i></a>`;
        }
      }
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  async saveDonorHistory() {
    let rData = this.donorRatingForm.get();
    let resData = await Service.addHistory(this.id, rData);
    $("#mdlDonorHistoryAdd").modal("hide");
    
  }

  openRatingModal(val, name) {
    // this.loadDonorHistory(val);
    $("#mdlDonorHistoryAdd").modal("show");
    $("#donorName").text(name);
  }
}

export default UserTable;
