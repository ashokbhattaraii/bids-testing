import config from "../config";
import { REST } from "rumsan-ui";
const rest = new REST({ url: config.apiPath, debugMode: config.debugMode });

class OrgService {
  editOrganization(body) {
    return rest.post({
      path: `/organizations`,
      body
    });
  }
}

export default new OrgService();
