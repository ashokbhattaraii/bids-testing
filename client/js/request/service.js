import { API } from "../core";

class UserService extends API {
  add(data) {
    return this.post({
      path: `/requests`,
      data
    });
  }

  addDocument(id, document) {
    return this.post({
      path: `/requests/${id}/documents`,
      data: document
    });
  }

  get(id) {
    return this.request(`/requests/${id}`);
  }

  remove(id) {
    return this.delete(`/requests/${id}`);
  }

  list() {
    return this.request("/requests?start=0&limit=25");
  }

  getS3Policy(data) {
    return this.post({ url: "/misc/s3policy", data });
  }
}

export default new UserService();
