import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Dropdown } from 'react-bootstrap';
import { smoothlyMenu } from '../Layouts/Helpers';
import $ from 'jquery';

import { logoutUser } from '../../utils/sessionManager';

class TopHeader extends React.Component {

    toggleNavigation(e) {
        e.preventDefault();
        $("body").toggleClass("mini-navbar");
        smoothlyMenu();
    }

    handleLogout = (e) => {
      e.preventDefault();
      this.props.logoutUser();
    }

    render() {
        return (
            <div className="row border-bottom">
                <nav className="navbar navbar-static-top white-bg" role="navigation" style={{marginBottom: 0}}>
                    <div className="navbar-header">
                        <a className="navbar-minimalize minimalize-styl-2 btn btn-primary " onClick={this.toggleNavigation} href="#"><i className="fa fa-bars"></i> </a>
                    </div>
                    <ul className="nav navbar-top-links navbar-right">
                        <li>
                          <Link to="#" onClick={this.handleLogout}><i className="fa fa-sign-out"></i> <span className="nav-label">Log out</span></Link>

                            {/* <a href="/login">
                                <i className="fa fa-sign-out"></i> Log out
                            </a> */}
                        </li>
                    </ul>
                </nav>
            </div>
        )
    }
}

const mapStateToProps = (store) => {
  return {

  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    logoutUser
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TopHeader));
