import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import ReduxToastr from 'react-redux-toastr';

import store from './store';
import { App } from './modules/App';

ReactDOM.render(
	<Provider store={store}>
		<Router>
      <span>
        <ReduxToastr
          timeOut={4000}
          newestOnTop={false}
          preventDuplicates
          position="top-right"
          transitionIn="fadeIn"
          transitionOut="fadeOut"
          progressBar
        />
        <App/>
      </span>
		</Router>
	</Provider>,
	document.getElementById('root')
)
