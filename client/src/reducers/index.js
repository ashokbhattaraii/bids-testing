import { combineReducers } from 'redux';
import { reducer as toastrReducer } from 'react-redux-toastr'

import { counterReducer } from './counterReducer';
import { userReducer } from './userReducer';

const reducer = combineReducers({
  toastr: toastrReducer,
	counter: counterReducer,
	user: userReducer,
})

export default reducer;
