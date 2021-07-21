import config from "../config";
import { REST } from "rumsan-ui";
const rest = new REST({ url: config.apiPath, debugMode: config.debugMode });

class UserService {
  add(body) {
    return rest.post({
      path: `/requests`,
      body
    });
  }

  addDocument(id, document) {
    return rest.post({
      path: `/requests/${id}/documents`,
      data: document
    });
  }

  get(id) {
    return rest.request(`/requests/${id}`);
  }

  getRequestListByDate(date) {
    return rest.request(`/requests/total?date=${date}`);
  }

  getDonors(id) {
    return rest.request(`/donors/${id}`);
  }

  getOrganizations(id) {
    return rest.request(`/donors/organizations/${id}`);
  }

  getHospitals() {
    return rest.request(`/organizations?type=hospital`);
  }

  saveRequestType(id, data) {
    return rest.patch({
      path: `/requests/${id}`,
      body: { request_type: `${data}` }
    });
  }

  getDispatchList(id, donorIds) {
    return rest.request({ path: `/donors/dispatch-list`, data: `${donorIds}` });
  }

  getDonorsLocal(id) {
    return rest.get(`/requests/${id}/donor`);
  }

  editRequest(id, body) {
    console.log(body);
    return rest.patch({
      path: `/requests/${id}`,
      body
    });
  }

  addDonorRequest(id, data) {
    return rest.post({
      path: `/requests/${id}/donor`,
      body: data
    });
  }

  addRequestedDonorFeedback(req_id, data) {
    return rest.post({
      path: `/requests/${req_id}/donor/feedback`,
      body: data
    });
  }

  removeManagedComponents(id, data) {
    return rest.patch({
      path: `/requests/${id}/remove-managed-component`,
      body: { type: data }
    });
  }

  removeDonor(id, donor_id) {
    return rest.delete({
      path: `/requests/${id}/donor`,
      body: {
        donor_id
      }
    });
  }

  removeOrganization(id, org_id) {
    return rest.delete({
      path: `/requests/${id}/organization`,
      body: {
        org_id
      }
    });
  }

  remove(id) {
    return rest.delete(`/requests/${id}`);
  }

  list() {
    return rest.request("/requests?start=0&limit=25");
  }

  addAdditionalDonors(id, data) {
    return rest.post({
      path: `/requests/${id}/new-donors`,
      body: data
    });
  }

  editAdditionalDonors(id, data) {
    return rest.post({
      path: `/requests/${id}/new-donors`,
      body: data
    });
  }

  getAdditionalDonorDetail(id) {
    return rest.get({
      path: `/requests/${id}/shared-donors?limit=100`
    });
  }

  getS3Policy(data) {
    return rest.post({ url: "/misc/s3policy", data });
  }

  addHistory(data) {
    return rest.post({
      path: `/donors/add-rating`,
      body: data
    });
  }

  getDonorHistory(id) {
    return rest.request(`/donors/${id}/history`);
  }

  getDonorRating(id) {
    return rest.request(`/donors/${id}/rating`);
  }

  getRequestLink(id) {
    return rest.request(`/requests/link/${id}`);
  }

  addRequestLink(id, data) {
    return rest.post({
      path: `/requests/${id}/link`,
      body: data
    });
  }

  updateRequestLink(id, linkId, data) {
    return rest.post({
      path: `/requests/${id}/link/${linkId}`,
      body: data
    });
  }

  removeExpiryLink(id) {
    return rest.delete(`/requests/${id}/expiry-link`);
  }

  getChartRequestDetails(days) {
    return rest.get(`/requests/chart-details?days=${days}`);
  }

  getChartRequestDetailsByDates(from_date, to_date) {
    return rest.get(`/requests/chart-details?from_date=${from_date}&&to_date=${to_date}`);
  }

  addDiagnosis(data) {
    return rest.post({
      path: `/requests/diagnosis`,
      body: data
    });
  }
}

export default new UserService();
