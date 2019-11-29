class Component {
  constructor(cfg) {
    this.config = cfg;
    if (!cfg.target) throw Error("Must have target property");
    this.target = cfg.target;
    this.comp = $(cfg.target);
    this.events = [];
  }

  addEvents() {
    this.events = [...this.events, ...arguments];
  }

  on(event, cb) {
    let exists = this.events.find(e => e === event);
    if (!exists) throw Error(`Event [${event}] is not registered`);
    $(this.target).on(event, cb);
  }

  trigger(event, data) {
    let exists = this.events.find(e => e === event);
    if (!exists) throw Error(`Event [${event}] is not registered`);
    $(this.target).trigger(event, data);
  }

  fire(event, data) {
    this.trigger(event, data);
  }
}

export default Component;
