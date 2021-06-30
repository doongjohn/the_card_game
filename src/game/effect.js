// TODO: make effect system

// Effect types
// - Activated
// - Quick
// - Continues
// - Lingering
// - Mandatory Trigger
// - Trigger

class Effect {
  constructor(card, func) {
    this.card = card;
    this.func = func;
    this.index = 0;
  }

  setIndex(i) {
    this.index = i;
  }
}

class EffectCallback {
  static onDealDamage = [];
  static onTakeDamage = [];

  add(when, effect) {
    const array = EffectCallback[when];
    effect.setIndex(array.length);
    array.push(effect);
  }
  remove(when, effect) {
    const array = EffectCallback[when];
    array.splice(effect.index, 1);
  }
}

class EffectChain {
  constructor() {
    this.effects = [];
  }
}

class EffectAction {
  static onDealDamage() {
    // print all avaliable cards make them selectable
    for (const fx of EffectCallback.onDealDamage) {
      fx.func();
    }
  }
  static onTakeDamage() {
    // print all avaliable cards make them selectable
    for (const fx of EffectCallback.onTakeDamage) {
      fx.func();
    }
  }
}