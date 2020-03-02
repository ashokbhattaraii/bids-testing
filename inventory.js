const axios = require("axios");
const config = require("config");
const fs = require("fs");

const credentialsPath = __dirname + "/config/auth_inventory.json";
const baseUrl = config.get("services.lifebank.url");

class Inventory {
  async auth() {
    let res = await axios.post(`${baseUrl}/auth`, {
      key: config.get("services.lifebank.key"),
      secret: config.get("services.lifebank.secret")
    });
    fs.writeFileSync(credentialsPath, JSON.stringify(res.data, null, 4));
    return res.data;
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
      if (e.response.status == 401) {
        let auth = await this.auth();
        config.headers["access_token"] = auth.token;
        let res = await axios(config);
        return res;
      } else {
        throw e;
      }
    }
  }

  async getOrganizationsList(limit, start) {
    let body = {};
    body.limit = limit;
    body.start = start;
    let { data, ...res } = await this.request({
      url: `${baseUrl}/organizations`,
      method: "get",
      data: body
    });
    return data;
  }

  async addOrganization(body) {
    await this.request({
      method: "post",
      url: `${baseUrl}/organizations`,
      data: body
    });
  }

  async editOrganization(id, body) {
    await this.request({
      method: "put",
      url: `${baseUrl}/organizations/${id}`,
      data: body
    });
  }

  async getSpecificOrganization(id) {
    let { data, ...res } = await this.request({
      url: `${baseUrl}/organizations/${id}`
    });
    return data;
  }
}
module.exports = new Inventory();
