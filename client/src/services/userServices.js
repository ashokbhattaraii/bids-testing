import axios from 'axios';
import APIConstants from '../constants/APIConstants';

export function loginUser(data) {
  return new Promise((resolve, reject) => {
    axios.post(APIConstants.LOGIN, data)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response.data)));
  });
}

export function resetPassword(id) {
  return new Promise((resolve, reject) => {
    axios.put(APIConstants.RESET_PASSWORD + id)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response.data)));
  });
}

export function changePassword(data) {
  return new Promise((resolve, reject) => {
    axios.put(APIConstants.CHANGE_PASSWORD + data._id, data)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response.data)));
  });
}

export function addUser(data) {
  return new Promise((resolve, reject) => {
    axios.post(APIConstants.USERS, data)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response)));
  });
}

export function getUserList() {
  return new Promise((resolve, reject) => {
    axios.get(APIConstants.USERS)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response.data)));
  });
}

export function findUser(id) {
  return new Promise((resolve, reject) => {
    axios.get(APIConstants.USERS + id)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response.data)));
  });
}

export function deleteUser(id) {
  return new Promise((resolve, reject) => {
    axios.delete(APIConstants.USERS + id)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response.data)));
  });
}

export function updateUser(data) {
  return new Promise((resolve, reject) => {
    axios.put(APIConstants.USERS + data._id, data)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response.data)));
  });
}

export function updateProfile(data) {
  return new Promise((resolve, reject) => {
    axios.put(APIConstants.USERS + data._id, data)
    .then(res => (resolve(res.data)))
    .catch(err => (reject(err.response.data)));
  });
}
