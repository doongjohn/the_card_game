class FSMState {
  onEnter(obj) { }
  onExit(obj) { }
}

class FSM {
  obj = null;
  prevState = null;
  curState = null;
  onStateChange = (obj) => {};

  constructor(obj, defaultState) {
    this.obj = obj;
    this.curState = defaultState.prototype;
  }

  setState(state) {
    if (state.prototype == this.curState) return;
    this.curState.onExit(this.obj);
    this.prevState = this.curState.prototype;
    this.curState = state.prototype;
    this.curState.onEnter(this.obj);
    this.onStateChange(this.obj);
  }
}