import { getUser, saveUser, saveUserToken, logoutUser } from '../utils/sessionManager';

const initialState = {
  loggedInUser : getUser(),
  loggedIn     : false,
  userList     : []
}

export function userReducer(state=initialState, action) {
	switch (action.type) {

    case 'LOGIN_USER_SUCCESS':
    saveUser(action.res);
    saveUserToken(action.res.token.toString());
      return {
        ...state,
        loggedInUser: action.res,
        loggedIn: true,
      };

    case 'ADD_USER_SUCCESS':
      return {
        ...state,
        userList: state.userList.concat(action.res)
      }

    case 'GET_USER_LIST_SUCCESS':
      return {
        ...state,
        userList: action.res
      }

    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        userList : state.userList.map((user) => {
          if (user._id === action.res._id) {
            return action.res;
          } else {
            return user;
          }
        })
      }

    case 'DELETE_USER_SUCCESS':
      return {
        ...state,
        userList : state.userList.filter(user => user._id !== action.res._id)
      }

		default:
			return {...state}
	}
}
