import React from 'react';
import { Switch, Route } from 'react-router-dom';

import $ from 'jquery';

import Progress from '../Global/Progress';
import Navigation from '../Global/Navigation';
import Footer from '../Global/Footer';
import TopHeader from '../Global/TopHeader';
import { correctHeight, detectBody } from '../Layouts/Helpers';
import Stats from '../Dashboard/Stats';
import Homepage from '../Home';
import RegisterPage from '../Register';
import Main from '../Views/Main';
import Minor from '../Views/Minor';
import Users from '../Users';

class Dashboard extends React.Component {

  render() {
    const wrapperClass = 'gray-bg ' + this.props.location.pathname;
    return (
      <div id="wrapper">
          <Progress />
          <Navigation location={this.props.location}/>
          <div id="page-wrapper" className={wrapperClass}>
              <TopHeader />

              <Switch>
                <Route exact path="/" component={Stats} />
                <Route path="/dashboard" component={Stats} />
                <Route path="/home" component={Homepage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/main" component={Main} />
                <Route path="/minor" component={Minor} />
                <Route path="/users" component={Users} />
              </Switch>

              <Footer />
          </div>
      </div>
    );
  }

  componentDidMount() {

    // Run correctHeight function on load and resize window event
    $(window).bind('load resize', function() {
      correctHeight();
      detectBody();
    });

    // Correct height of wrapper after metisMenu animation.
    $('.metismenu a').click(() => {
      setTimeout(() => {
        correctHeight();
      }, 300);
    });
  }
}

export default Dashboard;
