// TODO: make effect system

class EffectType {
  static Activated = 0;
  static MandatoryTrigger = 1;
  static Trigger = 2;
  static Quick = 3;
  static Continues = 4;
  static Lingering = 5;

  static toString(num) {
    // NOTE: this may change when the javascript gets updated
    return Object.getOwnPropertyNames(EffectType)[num + 4];
  }
}

class Effect {
  constructor(type, card, action) {
    this.index = 0;
    this.type = type;
    this.card = card;
    this.action = function (card) {
      if (card != this.card) return;
      action(...arguments);
      console.log(
        `Effect invoked: %c${EffectType.toString(this.type)}\n` +
        `%cPlayer${Match.turn}'s "${card.data.name}"`,
        'color: orange',
        'color: blue'
      );
    };
  }
}

class EffectChain {
  // TODO: make effect chain
  // if you add an effect to a chain
  // it will be added to the end
  // if the chain is complete (no new effect is added)
  // it will execute effects in chain in reversed order (end --> start)
  static effects = [];
}

class EffectEvent {
  // TODO: use linked list
  static onAttack = [];     // args: self, target
  static onDealDamage = []; // args: self, target
  static onTakeDamage = []; // args: self, attacker

  static add(event, effect) {
    const array = EffectEvent[event];
    effect.index = array.length;
    array.push(effect);
  }
  static remove(event, effect) {
    EffectEvent[event].splice(effect.index, 1);
  }
  static find(event, effect) {
    return EffectEvent[event].indexOf(effect);
  }
  static invoke(event, self, ...args) {
    if (EffectEvent[event].length == 0) {
      return;
    } else if (EffectEvent[event].length == 1) {
      EffectEvent[event][0].action(self, ...args);
    } else {
      // TODO: make user selects the order of execution
      for (let fx of EffectEvent[event])
        fx.action(self, ...args);
    }
  }
}