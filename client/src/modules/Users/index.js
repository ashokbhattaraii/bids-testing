import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';

import ModalPopup from '../Global/ModalPopup';
import UserAddForm from './UserAddForm';

import {
  addUser,
  getUserList,
  findUser,
  updateUser,
  deleteUser
} from '../../actions/userActions';

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modals  : {
        addUserModal  : false,
        editUserModal : false
      }
    };
  }

  componentDidMount = () => {
    this.props.getUserList()
  }

  modalToggle = (modal) => {
    this.setState({
      modals : {
        ...this.state.modals,
        [modal] : !this.state.modals[modal]
      }
    });
  }

  addUser = (payload) => {
    this.props.addUser(payload)
    .then((res) => {
      this.modalToggle('addUserModal');
      toastr.success('Success', 'User added successfully')
    })
  }

  handleEdit = (userId, e) => {
    e.preventDefault();
    console.log('res...........', userId);
    this.props.findUser(userId)
    .then((res) => {
      console.log('user,,,,,,,,,,,,,', res);
      this.setState({
        user : res
      });
      this.modalToggle('editUserModal');
    })
  }

  editUser = (payload) => {
    const data = {
      _id : this.state.user._id,
      ...payload
    }
    console.log('payload...............', data);
    this.props.updateUser(data)
    .then((res) => {
      this.modalToggle('editUserModal');
      toastr.success('Success', 'User updated successfully.');
      console.log('res,,,,,,,,,,,,upadte', res);
    })
  }

  handleDelete = (userId, e) => {
    e.preventDefault();
    this.props.deleteUser(userId)
    .then((res) => {
      toastr.success('Success', 'User deleted successfully.')
      console.log('deleted........', res);
    })
  }

  render() {
    const users = this.props.users;
    return (
        <div className="wrapper wrapper-content animated fadeInRight">
            <div className="row">
                <div className="col-lg-12">
                  {/* breadcrumb card starts here */}
                  <div className="row wrapper border-bottom white-bg page-heading">
                    <div className="col-lg-10">
                        <h2>Users</h2>
                        <ol className="breadcrumb">
                            <li>
                                <a href="index.html">Dashboard</a>
                            </li>
                            {/* <li>
                                <a>UI Elements</a>
                            </li> */}
                            <li className="active">
                                <strong>Users</strong>
                            </li>
                        </ol>
                    </div>
                  </div>
                  {/* breadcrumb card ends here */}

                  <div className="row wrapper border-bottom white-bg page-heading">
                    <div className="col-lg-12">
                      <button type="button" className="btn btn-w-m btn-primary" id="user-add-button" onClick={() => this.modalToggle('addUserModal')}>Add user</button>
                      <table className="table table-striped" id="user-table">
                          <thead>
                          <tr>
                              <th>#</th>
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Email</th>
                              <th>Actions</th>
                          </tr>
                          </thead>
                          <tbody>
                            {users.map((user, i) => {
                              return (
                              <tr key={i}>
                                <td>{i+1}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.email}</td>
                                <td>
                                  <a href="#" onClick={(e) => this.handleEdit(user._id, e)}><i className="fa fa-edit"></i></a>&nbsp;&nbsp;
                                  <a href="#" onClick={(e) => this.handleDelete(user._id, e)}><i className="fa fa-trash"></i></a>
                                </td>
                              </tr>
                              )}
                            )}
                          </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            </div>
            <ModalPopup
              isOpen={this.state.modals.addUserModal}
              onRequestClose={() => this.modalToggle('addUserModal')}
              title="Add User"
            >
              <UserAddForm
                submit = {this.addUser}
                buttonText = "Add"
              />
            </ModalPopup>
            <ModalPopup
              isOpen={this.state.modals.editUserModal}
              onRequestClose={() => this.modalToggle('editUserModal')}
              title="Edit User"
              edit = {false}
            >
              <UserAddForm
                submit = {this.editUser}
                userData = {this.state.user}
                buttonText = "Update"
                edit = {true}
              />
            </ModalPopup>
        </div>
    );
  }

}

const mapStateToProps = (store) => {
  return {
    users : store.user.userList
  };
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    addUser,
    getUserList,
    findUser,
    updateUser,
    deleteUser
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (Users);
