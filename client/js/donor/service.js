import config from "../config";
import { REST } from "rumsan-ui";
const rest = new REST({ url: config.apiPath, debugMode: config.debugMode });

class DonorService {
  get(donorId) {
    return rest.request(`/donors/${donorId}`);
  }

  edit(donorId, data) {
    return rest.post({
      path: `/donors/${donorId}`,
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

  changeDonorStatus(id, data) {
    return rest.post({
      path: `/donors/changeStatus/${id}`,
      body: data
    });
  }

  deleteUnverifiedDonor(id) {
    return rest.delete(`/donors/unverified/${id}`);
  }
}

export default new DonorService();
