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

  removeOrganization(id) {
    return rest.delete(`/organizations/${id}`);
  }

  addEmployee(body, id) {
    return rest.post({
      path: `/organizations/${id}/employee`,
      body
    });
  }

  getEmployeeDetail(emp_id) {
    return rest.request(`/organizations/employee/${emp_id}`);
  }

  addRole(emp_id, body) {
    return rest.post({
      path: `/organizations/employee/${emp_id}/roles`,
      body
    });
  }

  removeRole(emp_id, body) {
    return rest.delete({
      path: `/organizations/employee/${emp_id}/roles`,
      body
    });
  }

  updateUser(emp_id, body) {
    return rest.post({
      path: `/organizations/employee/${emp_id}`,
      body
    });
  }
}

export default new OrgService();
