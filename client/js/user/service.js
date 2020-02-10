import { API } from "../core";

class UserService extends API {
  add(data) {
    return this.post({
      path: `/users`,
      data
    });
  }

  get(userId) {
    return this.request(`/users/${userId}`);
  }

  list() {
    return this.request("/users?start=0&limit=25");
  }

  changeStatus(userId, is_active) {
    return this.post({
      path: `/users/${userId}/status`,
      data: { is_active }
    });
  }
}

export default new UserService();
