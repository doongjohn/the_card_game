class FSMState {
  compare() {
    for (const arg of arguments)
      if (this == arg.prototype)
        return true;
    return false;
  }
  onEnter(obj) { }
  onExit(obj) { }
}

class FSM {
  constructor(obj, defaultState, onStateChange) {
    this.obj = obj;
    this.prevState = null;
    this.curState = defaultState.prototype;
    this.curState.onEnter(this.obj);
    this.onStateChange = onStateChange;
    this.onStateChange(this.obj);
  }
  setStateProto(prototype) {
    if (!prototype || prototype == this.curState) return;
    this.curState.onExit(this.obj);
    this.prevState = this.curState;
    this.curState = prototype;
    this.curState.onEnter(this.obj);
    this.onStateChange(this.obj);
  }
  setState(state) {
    if (!state || state.prototype == this.curState) return;
    this.curState.onExit(this.obj);
    this.prevState = this.curState;
    this.curState = state.prototype;
    this.curState.onEnter(this.obj);
    this.onStateChange(this.obj);
  }
}
