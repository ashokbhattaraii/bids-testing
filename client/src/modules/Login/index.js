import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toastr } from 'react-redux-toastr';

import { loginUser } from '../../actions/userActions';

class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fields : {
        username : '',
        password : ''
      }
    }
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      fields : {
        ...this.state.fields,
        [e.target.name] : e.target.value
      }
    })
  }

  handleLogin = (e) => {
    e.preventDefault();
    this.props.loginUser(this.state.fields)
    .then((res) => {
      this.props.history.push('/dashboard')
      toastr.success('Success', 'Logged in successfully!')
    })
    .catch((err) => {
      toastr.error('Error', 'Login fail')
    })
  }

  render() {
    return (
			<div className="wrapper loginPage">
        <div className="row">
          {/* <div className="col-lg-4 col-lg-offset-4">
            <div className="logo">
              <img  src="/styles/img/zender_logo.png" height="100px" width="180px" alt=""/>
            </div>
          </div> */}
  				<div className="col-lg-4 col-lg-offset-4 ibox-content">
  					<form className="form-horizontal">
  						<h3>LOG IN</h3>
  						<div className="form-group">
    						<div className="col-lg-12">
                  <input type="text" name="username" placeholder="Username" className="form-control" value={this.state.fields.username} onChange={this.handleChange}/>
    						</div>
  					  </div>
    					<div className="form-group">
    						<div className="col-lg-12">
                  <input type="password" name="password" placeholder="Password" className="form-control" value={this.state.fields.password} onChange={this.handleChange}/>
                </div>
    					</div>
            	<div className="form-group">
            		<div className="col-lg-12">
            			<button className="btn btn-primary block full-width m-b" type="submit" onClick={this.handleLogin}>Log in</button>
            		</div>
            	</div>
              <a className="help-block m-b-none" href="#">Forgot your Password?</a>
            </form>
          </div>
  				<div className="col-lg-4 col-lg-offset-4 ibox-content">
            <div className="signup-card">
				    <h3> Don't have an account? </h3>
          	<Link className="btn btn-primary block full-width" to="#">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {

  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    loginUser
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (LoginPage);
