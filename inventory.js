const axios = require("axios");
const config = require("config");
const fs = require("fs");
const credentialsPath = __dirname + "/config/auth_inventory.json";
const baseUrl = config.get("services.lifebank.url");
class Inventory {
  async auth() {
    try {
      let res = await axios.post(`${baseUrl}/auth`, {
        key: config.get("services.lifebank.key"),
        secret: config.get("services.lifebank.secret")
      });
      fs.writeFileSync(credentialsPath, JSON.stringify(res.data, null, 4));
      return res.data;
    } catch (e) {
      if (e.response.status === 500) throw "Authentication Failed";
    }
  }
  async getToken() {
    try {
      if (!fs.existsSync(credentialsPath)) await this.auth();
      let credentials = fs.readFileSync(credentialsPath);
      let data = JSON.parse(credentials);
      if (!data.token) return "NO-TOKEN";
      return data.token;
    } catch (e) {
      return "NO-TOKEN";
    }
  }
  async request(config) {
    config.headers = config.headers || {};
    config.headers["content-type"] = "application/json";
    let token = await this.getToken();
    config.headers["access_token"] = await this.getToken();
    try {
      let res = await axios(config);
      return res;
    } catch (e) {
      if (e.response) {
        if (e.response.status == 401) {
          let auth = await this.auth();
          config.headers["access_token"] = auth.token;
          let res = await axios(config);
          return res;
        }
      } else {
        throw e;
      }
    }
  }
  async getOrganizationsList(name, address, limit, start) {
    let body = {};
    body.limit = limit ? limit : 1000;
    body.start = start ? limit : 0;
    body.name = name ? name : null;
    body.address = address ? address : null;
    //creating query string
    const qs = Object.keys(body).map(key => `${key}=${body[key]}`).join('&'); 
    let data = await this.request({
      url: `${baseUrl}/organizations?${qs}`,
      method: "get"
    });
    return data;
  }

  async addOrganization(body) {
    return await this.request({
      method: "post",
      url: `${baseUrl}/organizations`,
      data: body
    });
  }
  async editOrganization(id, body) {
    return await this.request({
      method: "put",
      url: `${baseUrl}/organizations/${id}`,
      data: body
    });
  }
  async deleteOrganization(id) {
    return await this.request({
      method: "delete",
      url: `${baseUrl}/organizations/${id}`
    });
  }
  async getSpecificOrganization(id) {
    let { data, ...res } = await this.request({
      url: `${baseUrl}/organizations/${id}`
    });
    return data;
  }
  async getOrganizationsEmployee(id) {
    let { data, ...res } = await this.request({
      url: `${baseUrl}/organizations/${id}/employee`
    });
    return data;
  }

  async addOrganizationsEmployee(id, body) {
    return await this.request({
      method: "post",
      url: `${baseUrl}/organizations/${id}/employee`,
      data: body
    });
  }

  async getOrganizationsEmployeeDetail(emp_id) {
    let { data, ...res } = await this.request({
      url: `${baseUrl}/organizations/employee/${emp_id}`
    });
    return data;
  }

  async editOrgEmployee(body, emp_id) {
    let data = await this.request({
      method: "post",
      url: `${baseUrl}/organizations/employee/${emp_id}`,
      data: body
    });
    return data.data;
  }

  async addOrgEmployeeRole(body, id) {
    let data = await this.request({
      method: "post",
      url: `${baseUrl}/organizations/employee/${id}/roles`,
      data: body
    });
    return data.data;
  }

  async removeOrgEmployeeRole(body, id) {
    let data = await this.request({
      method: "delete",
      url: `${baseUrl}/organizations/employee/${id}/roles`,
      data: body
    });
    return data.data;
  }

  async removeOrgEmployee(id) {
    let data = await this.request({
      method: "put",
      url: `${baseUrl}/organizations/employee/${id}/remove`,
    });
    return data.data;
  }
}
module.exports = new Inventory();
