import { TablePanel, Notify, Form } from "rumsan-ui";
import config from "../config";
import service from "./service";

class PatientFeedbackTable extends TablePanel {
  constructor(cfg) {
    cfg.url = `${config.apiPath}/requests/patient-feedback`;
    super(cfg);
    this.render();

    this.registerEvents(
      "change-patient-feedback-status",
      "toggle-patient-feedback-modal",
      "table-load-by-date"
    );

    this.on("change-patient-feedback-status", (e, d) => {
      this.updatePatientVerification(d);
    });

    this.on("toggle-patient-feedback-modal", (e, d) => {
      this.toggle(d.id);
    });

    this.patientFeedbackForm = new Form({
      target: `#frmPatientFeedbackModal`,
      onSubmit: () => {
        this.addPatientFeedback();
      }
    });
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
        data: null,
        render: d => {
          return d && d.requester_phone ? d.requester_phone : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          return d && d.patient_feedback && d.patient_feedback.email ? d.patient_feedback.email : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          return d.requester_name ? `${d.requester_name}` : "N/A";
        }
      },
      {
        data: null,
        render: d => {
          return d && d.hospital ? d.hospital : "N/A";
        }
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
          let managedFromArr = [];
          if(d && d.request_managed_from) managedFromArr.push(d.request_managed_from);
          if(d && d.managed_products && d.managed_products.length){
            d.managed_products.forEach(el => {
              if(el.request_managed_from && !managedFromArr.includes(el.request_managed_from)) managedFromArr.push(el.request_managed_from);
            })
          }
          return managedFromArr.length ? managedFromArr.join(', ') : "";
        }
      },
      {
        data: null,
        render: data => {
          return data && data.status ? data.status : "";
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
        render: data => {
          if (!data.patient_feedback) return "N/A";
          else if (data.patient_feedback.status === "!contacted") return "Not Contacted";
          else return data.patient_feedback.status;
        }
      },
      {
        data: null,
        render: d => {
          if (d.patient_feedback.is_verified && d.patient_feedback.is_verified === true)
            return `<input type="checkbox" checked onclick="$('#tblPatientFeedbackRequest').trigger('change-patient-feedback-status',{id: '${d._id}', value:'false'})" id='verify_${d._id}' />`;
          else
            return `<input type="checkbox" onclick="$('#tblPatientFeedbackRequest').trigger('change-patient-feedback-status',{id: '${d._id}', value:'true'})" id='verify_${d._id}' />`;
        }
      },
      {
        data: null,
        class: "text-center",
        render: d => {
          return `
          <div class=row>
          <div class="col-sm-4"><a onclick="$('#tblPatientFeedbackRequest').trigger('toggle-patient-feedback-modal', {id: '${d._id}'})" 
           id="addPatientFeedback" title='Add Patient Feedback'>
          <i class='btn btn-primary btn-xs fa fa-edit user-icon'></i></a></div>`;
        }
      }
    ];
  }

  reload(firstPage=true) {
    this.table.ajax.reload(null, firstPage);
  }

  async addPatientFeedback() {
    let data = this.patientFeedbackForm.get();
    let resData = await service.editRequest(data.requestId, data);
    if (!resData) {
      Notify.error("Something went wrong. Try again Later.");
      this.patientFeedbackForm.clear();
    } else {
      this.reload(false);
      this.toggle();
      this.patientFeedbackForm.clear();
      Notify.show("Successfully added the Feedback.");
    }
  }

  async updatePatientVerification(payload) {
    let isConfirm = await swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "green",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!"
    });

    try {
      if (isConfirm.value) {
        let value = { "patient_feedback.is_verified": payload.value };
        await service.editRequest(payload.id, value);
        this.reload(false);
        Notify.show(`The patient Feedback status has been updated.`);
      }
      else{
        $(`#tblPatientFeedbackRequest #verify_${payload.id}`).prop('checked',!(payload.value === 'true'));
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  async toggle(id) {
    this.patientFeedbackForm.clear();
    $("#mdlPatientFeedbackModal").modal("toggle");
    if (id) {
      let resData = await service.get(id);
      if (resData.patient_feedback) this.patientFeedbackForm.set(resData.patient_feedback);
      $("#requestId").val(id);
    }
  }
}

export default PatientFeedbackTable;
