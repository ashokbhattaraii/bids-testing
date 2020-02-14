const axios = require("axios");
const config = require("config");
const fs = require("fs");

const credentialsPath = __dirname + "/../config/auth_donation.json";
const baseUrl = config.get("services.donation.url");

class Donation {
  async auth() {
    let res = await axios.post(`${baseUrl}/users/auth`, {
      key: config.get("services.donation.key"),
      secret: config.get("services.donation.secret")
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

  async getDonorsList() {
    return this.request({
      url: `${baseUrl}/donors`
    });
  }
}

module.exports = new Donation();
