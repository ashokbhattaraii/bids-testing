const axios = require("axios");
const config = require("config");
const fs = require("fs");

const credentialsPath = __dirname + "/config/auth_donation.json";
const baseUrl = config.get("services.donation.url");

class Donation {
  async auth() {
    let res = await axios.post(`${baseUrl}/auth`, {
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

  async getDonorsList(limit, start, group, name, address, phone) {
    let body = {};
    body.limit = limit;
    body.start = start;
    body.group = group;
    body.name = name;
    body.address = address;
    body.phone = phone;
    let { data, ...res } = await this.request({
      url: `${baseUrl}/donors`,
      method: "get",
      data: body
    });

    return data;
  }

  async editDonors(id, body) {
    await this.request({
      method: "post",
      url: `${baseUrl}/donors/${id}`,
      data: body
    });
  }

  async getSpecificDonor(id) {
    let { data, ...res } = await this.request({
      url: `${baseUrl}/donors/${id}`
    });
    return data;
  }

  async getDispatchList(ids) {
    let { data, ...res } = await this.request({
      url: `${baseUrl}/donors/dispatch-list`
    });
    return data;
  }

  async dispatch(id, group, address, name, gender, ids, limit, start) {
    let body = {};
    body.group = group;
    body.address = address;
    body.name = name;
    body.gender = gender;
    body.ids = ids;
    body.limit = limit;
    body.start = start;
    let { data, ...res } = await this.request({
      url: `${baseUrl}/donors/dispatch/${id}`,
      method: "get",
      data: body
    });
    return data;
  }
}

module.exports = new Donation();
