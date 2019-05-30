import React from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';

import './Modal.css';

export default class ModalPopup extends React.Component {

  customModalStyles = {
    content : {
      top                   : '0',
      left                  : '0',
      right                 : '0',
      bottom                : '0',
      margin                : '65px auto',
      maxWidth              : this.props.maxWidth || '800px',
      border                : '0 solid rgba(0,0,0,.2)',
      boxShadow             : '0 5px 20px rgba(0,0,0,.07)',
      borderRadius          : '2px',
      padding               : '0',
      height                : '0',
      overflow              : 'visible',
      backgroundColor       : 'rgba(0, 0, 0, 0.5)',
      zIndex                : 10000
    }
  };

  render() {
    return (
      <div>
        <Modal
          isOpen={this.props.isOpen}
          onRequestClose={this.props.onRequestClose}
          contentLabel="Modal"
          ariaHideApp={false}
          style={this.customModalStyles}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <h4>{this.props.title}</h4>
              </div>
              {/* <Link to='#' onClick={this.props.onRequestClose}>
                <i className="fa fa-close" />
              </Link> */}
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
