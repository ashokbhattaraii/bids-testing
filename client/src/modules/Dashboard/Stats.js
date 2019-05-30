import React, { Component } from 'react';

class Stats extends Component {

  render() {
    return (
      <div className="wrapper wrapper-content">
        <div className="row">
                    <div className="col-lg-3">
                        <div className="ibox float-e-margins">
                            <div className="ibox-title">
                                <span className="label label-success pull-right">Monthly</span>
                                <h5>Income</h5>
                            </div>
                            <div className="ibox-content">
                                <h1 className="no-margins">40 886,200</h1>
                                <div className="stat-percent font-bold text-success">98% <i className="fa fa-bolt"></i></div>
                                <small>Total income</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3">
                        <div className="ibox float-e-margins">
                            <div className="ibox-title">
                                <span className="label label-info pull-right">Annual</span>
                                <h5>Orders</h5>
                            </div>
                            <div className="ibox-content">
                                <h1 className="no-margins">275,800</h1>
                                <div className="stat-percent font-bold text-info">20% <i className="fa fa-level-up"></i></div>
                                <small>New orders</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3">
                        <div className="ibox float-e-margins">
                            <div className="ibox-title">
                                <span className="label label-primary pull-right">Today</span>
                                <h5>visits</h5>
                            </div>
                            <div className="ibox-content">
                                <h1 className="no-margins">106,120</h1>
                                <div className="stat-percent font-bold text-navy">44% <i className="fa fa-level-up"></i></div>
                                <small>New visits</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3">
                        <div className="ibox float-e-margins">
                            <div className="ibox-title">
                                <span className="label label-danger pull-right">Low value</span>
                                <h5>User activity</h5>
                            </div>
                            <div className="ibox-content">
                                <h1 className="no-margins">80,600</h1>
                                <div className="stat-percent font-bold text-danger">38% <i className="fa fa-level-down"></i></div>
                                <small>In first month</small>
                            </div>
                        </div>
            </div>
        </div>
      </div>
    )
  }

}

export default Stats
