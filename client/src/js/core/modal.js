import Component from "./component";

class Modal extends Component {
  constructor(cfg) {
    super(cfg);
  }

  open() {
    $(this.target).modal("show");
  }

  close() {
    $(this.target).modal("hide");
  }
}

export default Modal;
