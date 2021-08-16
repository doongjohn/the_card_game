// TODO: make effect system

class EffectType {
  static Activated = 0;
  static MandatoryTrigger = 1;
  static Trigger = 2;
  static Quick = 3;
  static Continues = 4;
  static Lingering = 5;

  static toString(num) {
    // note this may change when the javascript gets updated
    return Object.getOwnPropertyNames(EffectType)[num + 4];
  }
}

class Effect {
  constructor(type, card, action) {
    this.index = 0;
    this.type = type;
    this.card = card;
    this.action = function (self) {
      if (self != this.card) return;

      action(...arguments);
      console.log(
        `<Effect:${EffectType.toString(this.type)}> Player${Match.turn}'s "${self.data.name}"`
      );
    };
  }
  setIndex(i) {
    this.index = i;
  }
}

class EffectCallback {
  // TODO: use linked list
  static onAttack = [];
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
    return EffectCallback[when].indexOf(effect);
  }
}

class EffectChain {
  // TODO: implement effect chain
  constructor() {
    this.effects = [];
  }
}

class EffectAction {
  static onAttack(self, target) {
    for (let fx of EffectCallback.onAttack)
      fx.action(self, target);
  }
  static onDealDamage(self, target) {
    for (let fx of EffectCallback.onDealDamage)
      fx.action(self, target);
  }
  static onTakeDamage(self, attacker) {
    for (let fx of EffectCallback.onTakeDamage)
      fx.action(self, attacker);
  }
}