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

  addUnverifiedDonor(data) {
    return rest.post({
      path: `/donors/unverified/add`,
      body: data
    });
  }
}

export default new DonorService();
