import config from "../config";
import { REST } from "rumsan-ui";
const rest = new REST({ url: config.apiPath, debugMode: config.debugMode });

class OrgService {
  addOrganization(body) {
    return rest.post({
      path: `/organizations/add`,
      body
    });
  }

  editOrganization(id, body) {
    return rest.post({
      path: `/organizations/${id}`,
      body
    });
  }

  getOrganization(id) {
    return rest.request(`/donors/organizations/${id}`);
  }
}

export default new OrgService();
