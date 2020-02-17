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

  getDonors(id) {
    return rest.request(`/donors/${id}`);
  }

  getDonorsLocal(id) {
    return rest.request(`/requests/${id}/donor`);
  }

  editRequest(id, body) {
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

  removeDonor(id, donor_id) {
    return rest.delete({
      path: `/requests/${id}/donor`,
      body: {
        donor_id
      }
    });
  }

  remove(id) {
    return rest.delete(`/requests/${id}`);
  }

  list() {
    return rest.request("/requests?start=0&limit=25");
  }

  getS3Policy(data) {
    return rest.post({ url: "/misc/s3policy", data });
  }
}

export default new UserService();
