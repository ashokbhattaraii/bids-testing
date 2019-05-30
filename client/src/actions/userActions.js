import * as userServices from '../services/userServices';

export function loginUser(data) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.loginUser(data)
      .then(res => {
        dispatch(loginUserSuccess(res));
        resolve(res);
      })
      .catch(err => {
        dispatch(loginUserError(err));
        reject(err);
      });
    });
  };
}

function loginUserSuccess(res) {
  return {
    type: 'LOGIN_USER_SUCCESS',
    res
  };
}

function loginUserError(err) {
  return {
    type: 'LOGIN_USER_FAIL',
    err
  };
}

export function logoutUser() {
  return {
    type: 'LOGOUT_USER'
  };
}

export function resetPassword(id) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.resetPassword(id)
      .then((res) => {
        dispatch(resetPasswordSuccess(res));
        resolve(res);
      })
      .catch((err) => {
        dispatch(resetPasswordError(err));
        reject(err);
      });
    });
  };
}

export function resetPasswordSuccess(res) {
  return {
    type: 'RESET_PASSWORD_SUCCESS',
    res
  };
}

export function resetPasswordError(err) {
  return {
    type: 'RESET_PASSWORD_ERROR',
    err
  };
}

export function addUser(data) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.addUser(data)
      .then((res) => {
        dispatch(addUserSuccess(res));
        resolve(res);
      })
      .catch((err) => {
        dispatch(addUserError(err));
        reject(err);
      });
    });
  };
}

function addUserSuccess(res) {
  return {
    type: 'ADD_USER_SUCCESS',
    res
  };
}

function addUserError(err) {
  return {
    type: 'ADD_USER_FAIL',
    err
  };
}

export function getUserList() {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.getUserList()
      .then((res) => {
        dispatch(getUserListSuccess(res));
        resolve(res);
      })
      .catch((err) => {
        dispatch(getUserListError(err));
        reject(err);
      });
    });
  };
}

function getUserListSuccess(res) {
  return {
    type: 'GET_USER_LIST_SUCCESS',
    res
  };
}

function getUserListError(err) {
  return {
    type: 'GET_USER_LIST_FAIL',
    err
  };
}

export function findUser(id) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.findUser(id)
      .then((res) => {
        dispatch(findUserSuccess(res));
        resolve(res);
      })
      .catch((err) => {
        dispatch(findUserError(err));
        reject(err);
      });
    });
  };
}

function findUserSuccess(res) {
  return {
    type: 'FIND_USER_SUCCESS',
    res
  };
}

function findUserError(err) {
  return {
    type: 'FIND_USER_FAIL',
    err
  };
}
export function deleteUser(id) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.deleteUser(id)
      .then((res) => {
        dispatch(deleteUserSuccess(res));
        resolve(res);
      })
      .catch((err) => {
        dispatch(deleteUserError(err));
        reject(err);
      });
    });
  };
}

function deleteUserSuccess(res) {
  return {
    type: 'DELETE_USER_SUCCESS',
    res
  };
}

function deleteUserError(err) {
  return {
    type: 'DELETE_USER_FAIL',
    err
  };
}

export function updateUser(data) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.updateUser(data)
      .then((res) => {
        dispatch(updateUserSuccess(res));
        resolve(res);
      })
      .catch((err) => {
        dispatch(updateUserError(err));
        reject(err);
      });
    });
  };
}

function updateUserSuccess(res) {
  return {
    type: 'UPDATE_USER_SUCCESS',
    res
  };
}

function updateUserError(err) {
  return {
    type: 'UPDATE_USER_FAIL',
    err
  };
}

export function updateProfile(data) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.updateProfile(data)
      .then((res) => {
        dispatch(updateProfileSuccess(data));
        resolve(res);
      })
      .catch((err) => {
        dispatch(updateProfileError(err));
        reject(err);
      });
    });
  };
}

function updateProfileSuccess(res) {
  return {
    type: 'UPDATE_PROFILE_SUCCESS',
    res
  };
}

function updateProfileError(err) {
  return {
    type: 'UPDATE_PROFILE_FAIL',
    err
  };
}

export function changePassword(data) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      userServices.changePassword(data)
      .then((res) => {
        dispatch(changePasswordSuccess(res));
        resolve(res);
      })
      .catch((err) => {
        dispatch(changePasswordError(err));
        reject(err);
      });
    });
  };
}

function changePasswordSuccess(res) {
  return {
    type: 'CHANGE_PASSWORD_SUCCESS',
    res
  };
}

function changePasswordError(err) {
  return {
    type: 'CHANGE_PASSWORD_FAIL',
    err
  };
}
