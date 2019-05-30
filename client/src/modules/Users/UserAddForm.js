import React, {PropTypes} from 'react';

export default class UserAddForm extends React.Component {
  constructor(props) {
    super(props);
    const user = props.userData ? props.userData.extras : '';
    this.state = {
      fields : {
        firstName :  user.firstName || '',
        lastName  :  user.lastName || '',
        username  :  user.username || user.email || '',
      }
    }
  }

  componentDidMount = () => {
    // this.props.userData &&
    // this.setState({
    //   fields : {
    //     ...this.state.fields,
    //     this
    //   }
    // })
    console.log('cdm..............', this.props);
  }

  componentWillReceiveProps = () => {
    console.log('wrp..............', this.props);
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      fields  : {
        ...this.state.fields,
        [e.target.name] : e.target.value
      }
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log('this,,,,,,,,,,,,,,,,', this.state.fields);
    this.props.submit(this.state.fields)
  }

  render() {
    return (
    <div>
      <form className="form-horizontal">
        <div className="form-group">
          <div className="row">
            {/* <div className="col-lg-6">
              <label>User Name</label>
              <input type="text" className="form-control" name="username" value={this.state.fields.username} onChange={this.handleChange}/>
            </div> */}
            <div className="col-lg-6">
              <label>First Name</label>
              <input type="text" className="form-control" name="firstName" value={this.state.fields.firstName} onChange={this.handleChange}/>
            </div>
            <div className="col-lg-6">
              <label>Last Name</label>
              <input type="text" className="form-control" name="lastName" value={this.state.fields.lastName} onChange={this.handleChange}/>
            </div>
            <div className="col-lg-6">
              <label>Email</label>
              <input type="email" className="form-control" name="username" value={this.state.fields.username} onChange={this.handleChange} disabled={this.props.edit}/>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="row">
            <div className="col-lg-2">
              <button className="btn btn-primary block full-width m-b" onClick={this.handleSubmit} type="submit">{this.props.buttonText || 'Submit'}</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
  }
}
UserAddForm.propTypes = {
};
