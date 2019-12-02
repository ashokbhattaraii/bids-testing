import config from "../config";

class API {
  async request(options) {
    if (typeof options == "string") options = { path: options };
    options.url = options.url || `${config.apiPath}${options.path}`;
    options.method = options.method || "GET";
    options.headers = options.headers || {};
    options.headers["content-type"] = "application/json";
    options.headers["access_token"] = Cookies.get("access_token");
    try {
      let res = await axios(options);
      return res.data;
    } catch (e) {
      if (e.response.status == 401) {
        location.href = "/login";
      } else {
        if (toastr) {
          toastr.error(e.response.data.message);
        } else {
          alert(e.response.data.message);
        }
        console.log(e.response);
      }
      return false;
    }
  }

  post(options) {
    options.method = "POST";
    return this.request(options);
  }

  delete(path) {
    let options = { method: "DELETE", path };
    return this.request(options);
  }
}

export default API;
