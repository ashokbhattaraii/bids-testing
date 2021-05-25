import config from "../config";
import { REST } from "rumsan-ui";
const rest = new REST({ url: config.apiPath, debugMode: config.debugMode });

class DonorService {
  get(donorId) {
    return rest.request(`/donors/${donorId}`);
  }

  addDonorHistory(data){
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

  edit(donorId, data) {
    return rest.post({
      path: `/donors/${donorId}`,
      body: data
    });
  }

  editDonorDataedit(donorId, data) {
    return rest.post({
      path: `/donors/${donorId}/edit`,
      body: data
    });
  }

  getUnverifiedDonor(id) {
    return rest.request(`/donors/unverified/${id}`);
  }

  addUnverifiedDonor(data) {
    return rest.post({
      path: `/donors/unverified/add`,
      body: data
    });
  }

  editUnverifiedDonor(id, data) {
    return rest.post({
      path: `/donors/unverified/${id}/edit`,
      body: data
    });
  }

  verifyDonor(id) {
    return rest.post({
      path: `/donors/unverified/${id}/verify`
    });
  }

  deleteUnverifiedDonor(id) {
    return rest.delete(`/donors/unverified/${id}`);
  }
}

export default new DonorService();
