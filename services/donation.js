const axios = require("axios");
const config = require("config");
const fs = require("fs");

const credentialsPath = __dirname + "/../config/auth_donation.json";
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

  async listEvents({ org, start, limit, search }) {
    console.log(search);
    return this.request({
      url: `${baseUrl}/events?org_id=${org}&start=${start}&limit=${limit}&search=${search}`
    });
  }

  async listDonors(eventId) {
    return this.request({
      url: `${baseUrl}/events/${eventId}/donors?is_complete=true&limit=500`
    });
  }

  async getEvent(eventId) {
    return this.request({
      url: `${baseUrl}/events/${eventId}`
    });
  }

  async createEvent(payload) {
    let data = Object.assign({}, payload);
    return this.request({
      url: `${baseUrl}/events`,
      method: "POST",
      data
    });
  }

  async getDonorByPhone(phone) {
    return this.request({
      url: `${baseUrl}/donors/search/byphone?phone=${phone}`
    });
  }
  async createTeam(payload) {
    let data = Object.assign({}, payload);
    return this.request({
      url: `${baseUrl}/teams`,
      method: "POST",
      data
    });
  }

  async searchTeam({ search, limit = 20, start = 0 }) {
    return this.request({
      url: `${baseUrl}/teams?limit=${limit}&start=${start}&search=${search}`,
      method: "GET"
    });
  }

  async addConsent(payload, { eventId }) {
    let data = Object.assign({}, payload);
    return this.request({
      url: `${baseUrl}/events/${eventId}/consent`,
      method: "POST",
      data
    });
  }

  async addDonor(donorPayload) {
    let data = Object.assign({}, donorPayload);
    return this.request({
      url: `${baseUrl}/donors`,
      method: "POST",
      data
    });
  }
}

module.exports = new Donation();
