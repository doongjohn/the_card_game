// TODO: make effect system

// Effect types
// - Activated
// - Quick
// - Continues
// - Lingering
// - Mandatory Trigger
// - Trigger

class EffectChain {
  constructor() {
    this.effects = [];
  }
}

class Effect {
  static onDealDamage = [];
  static onTakeDamage = [];
}

class EffectAction {
  static onDealDamage() {
    // print all avaliable cards make them selectable
    for (const fx of Effect.onDealDamage) {
      console.log(fx);
    }
  }
  static onTakeDamage() {
    // print all avaliable cards make them selectable
    for (const fx of Effect.onTakeDamage) {
      console.log(fx);
    }
  }
}