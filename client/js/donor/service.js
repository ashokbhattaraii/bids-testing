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

  get(userId) {
    return rest.request(`/requests/${userId}`);
  }

  list() {
    return rest.request("/requests?start=0&limit=25");
  }

  getS3Policy(data) {
    return rest.post({ url: "/misc/s3policy", data });
  }
}

export default new UserService();
