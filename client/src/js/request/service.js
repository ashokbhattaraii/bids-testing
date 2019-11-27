import { API } from "../core";

class UserService extends API {
  add(data) {
    return this.post({
      path: `/requests`,
      data
    });
  }

  get(userId) {
    return this.request(`/requests/${userId}`);
  }

  list() {
    return this.request("/requests?start=0&limit=25");
  }
}

export default new UserService();
