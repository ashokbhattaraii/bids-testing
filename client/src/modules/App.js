import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import LoginPage from '../modules/Login';
import Dashboard from '../modules/Dashboard';

import { getUser } from '../utils/sessionManager';

import './App.css';

export class App extends Component {

  render() {
    return (
  		<span>
  		<Switch>
  		<Route exact path="/login" component={LoginPage} />
      {
        getUser() ? <Route component={Dashboard} /> :
        <Redirect to="/login" />
      }
  		{/* <Route path="/" component={Dashboard} /> */}
  		</Switch>
  		</span>
    );
  }
}
