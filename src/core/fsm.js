class FsmState {
  /** @param {...FsmState} states */
  is(...states) {
    for (const state of states)
      if (this == state.prototype)
        return true
    return false
  }
  onStateEnter(obj) { }
  onStateExit(obj) { }
}

class Fsm {
  constructor(obj, defaultState, onStateChange) {
    this.obj = obj
    this.prevState = null
    this.curState = defaultState.prototype
    this.curState.onStateEnter(this.obj)
    this.onStateChange = onStateChange
    this.onStateChange(this.obj)
  }

  /** @param {FsmState} state */
  setState(state) {
    if (!state || state.prototype == this.curState)
      return
    this.curState.onStateExit(this.obj)
    this.prevState = this.curState
    this.curState = state.prototype
    this.curState.onStateEnter(this.obj)
    this.onStateChange(this.obj)
  }
}
