import { TablePanel,Notify } from "rumsan-ui";
import config from "../config";
import service from "./service";

class UserTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/requests`;
    super(cfg);
    this.render();

    this.registerEvents("change-patient-feedback-status");

    this.on("change-patient-feedback-status",(e,d)=>{
      this.updatePatientVerification(d)
    })

  }

  setColumns() {
    return [
      {
        data: null,
        render: function (data) {
          return `<a href="/requests/edit/${data._id}">${data.patient_name}</a>`;
        }
      },
      {
        data: "requester_phone"
      },
      {
        data: null,
        render: d => {
          return d.requester_name ? `${d.requester_name}` : "N/A";
        }
      },
      {
        data: "hospital"
      },

      {
        data: null,
        render: d => {
          return d.blood_group ? `${d.blood_group}${d.rh_factor}` : "N/A";
        }
      },
      {
        data: null,
        render: data => {
          if (!data.requested_date) return "";
          else return moment(data.requested_date).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        render: d => {
          return d.request_type ? d.request_type : "";
        }
      },
      {
        data: null,
        render: data => {
          if (!data.status) return "";
          else return data.status;
        }
      },
      {
        data: null,
        render: data => {
          if (!data.createdAt) return "";
          else return moment(data.createdAt).format("YYYY-MM-DD");
        }
      },
      {
        data: null,
        render: d => {
          if (d.patient_feedback_verification && d.patient_feedback_verification === true)
            return `<input type="checkbox" checked onclick="$('#tblPatientFeedbackRequest').trigger('change-patient-feedback-status',{id: '${d._id}', value:'false'})" />`;
          else
            return `<input type="checkbox" onclick="$('#tblPatientFeedbackRequest').trigger('change-patient-feedback-status',{id: '${d._id}', value:'true'})" />`;
        }
      },
    ];
  }

  reload() {
    this.table.ajax.reload();
  }

  async updatePatientVerification(payload){
    let isConfirm = await swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!'
    });

    try {
      if (isConfirm.value) {
        let value = {patient_feedback_verification:payload.value}
       await service.editRequest(payload.id,value);
        this.reload()
        Notify.show(`The patient Feedback status has been updated.`);
      }
    } catch (e) {
      console.log(e.message);
    }
    
  }

}

export default UserTable;
