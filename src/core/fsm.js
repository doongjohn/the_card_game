class FSMState {
  onEnter(self) { }
  onExit(self) { }
}

class FSM {
  prevState = null;
  curState = null;
  onStateChange = (self) => {};

  constructor(self, defaultState) {
    this.self = self;
    this.curState = defaultState.prototype;
  }

  setState(state) {
    if (state.prototype == this.curState) return;
    this.curState.onExit(this);
    this.prevState = this.curState.prototype;
    this.curState = state.prototype;
    this.curState.onEnter(this);
    this.onStateChange(this);
  }
}