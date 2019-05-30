import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as counterActions from '../../actions/counterActions';
import logo from '../logo.svg';

import Counter from './Counter';

class Homepage extends Component {

	render() {
		return (
			<div className="App">
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to React</h2>
				</div>
				<p className="App-intro">
					To get started, edit <code>src/modules/Home/Container/index.js</code> and save to reload.
				</p>
				<Counter
					count={this.props.count}
					incrementAsync={this.props.incrementAsync}
					increment={this.props.increment} decrement={this.props.decrement}
				/>
			</div>
		)
	}
}

const mapStateToProps = (store) => {
	return store.counter;
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators(counterActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Homepage)
