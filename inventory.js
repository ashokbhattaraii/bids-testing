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
      console.log(res);
      return res;
    } catch (e) {
      console.log(e.message);
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

  async getOrganizationsList() {
    let { data, ...res } = await this.request({
      url: `${baseUrl}/organizations`
    });
    return data;
  }

  async editOrganization(payload) {
    let data = Object.assign({}, payload);
    let resData = await this.post({
      url: `${baseUrl}/organizations/${id}`,
      method: "POST",
      data
    });
  }
}
module.exports = new Inventory();
