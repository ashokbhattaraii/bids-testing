import Component from "./component";

class Modal extends Component {
  constructor(cfg) {
    super(cfg);
    this.addEvents("open", "close");
  }

  open() {
    $(this.target).modal("show");
    this.fire("open", this);
  }

  close() {
    $(this.target).modal("hide");
    this.fire("close", this);
  }
}

export default Modal;
