// TODO: make effect system

class EffectType {
  static Activated = 0;
  static MandatoryTrigger = 1;
  static Trigger = 2;
  static Quick = 3;
  static Continues = 4;
  static Lingering = 5;
}

class Effect {
  constructor(type, card, action) {
    this.index = 0;
    this.type = type;
    this.card = card;
    this.action = function(self) {
      if (self == this.card) {
        console.log(`<Effect:onDealDamage> Player${Match.turn}'s "${self.data.name}"`);
        action(...arguments);
      }
    };
  }

  setIndex(i) {
    this.index = i;
  }
}

class EffectCallback {
  // TODO: use linked list
  static onDealDamage = [];
  static onTakeDamage = [];

  static add(when, effect) {
    const array = EffectCallback[when];
    effect.setIndex(array.length);
    array.push(effect);
  }
  static remove(when, effect) {
    const array = EffectCallback[when];
    array.splice(effect.index, 1);
  }
  static find(when, effect) {
    const array = EffectCallback[when];
    let i = 0;
    for (const fx of array) {
      if (fx == effect) return i;
      ++i;
    }
    return -1;
  }
}

class EffectChain {
  constructor() {
    this.effects = [];
  }
}

class EffectAction {
  static onDealDamage(self, target) {
    for (const fx of EffectCallback.onDealDamage) {
      fx.action(self, target);
    }
  }
  static onTakeDamage(self, attacker) {
    for (const fx of EffectCallback.onTakeDamage) {
      fx.action(self, attacker);
    }
  }
}