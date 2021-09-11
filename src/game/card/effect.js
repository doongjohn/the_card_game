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
    this.action = action;
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
  static onAttack = [];            // args: self, target
  static onCounterAttack = [];     // args: self, target
  static onDealDamage = [];        // args: self, target
  static onTakeDamage = [];        // args: self, attacker

  static add(eventName, effect) {
    const array = EffectEvent[eventName];
    effect.index = array.length;
    array.push(effect);
  }
  static remove(eventName, effect) {
    EffectEvent[eventName].splice(effect.index, 1);
  }
  static find(eventName, effect) {
    return EffectEvent[eventName].indexOf(effect);
  }
  static invoke(eventName, self, ...args) {
    if (EffectEvent[eventName].length == 0)
      return;

    if (EffectEvent[eventName].length == 1) {
      if (EffectEvent[eventName][0].card != self) return;
      console.log(
        `Effect invoked: %c"${eventName}": ${EffectType.toString(EffectEvent[eventName][0].type)}\n` +
        `%cPlayer${EffectEvent[eventName][0].card.cardPiece.pieceData.team}'s "${EffectEvent[eventName][0].card.data.name}"`,
        'color: orange',
        'color: blue'
      );
      EffectEvent[eventName][0].action(self, ...args);
      return;
    }

    // TODO: make user selects the order of execution
    for (let effect of EffectEvent[eventName]) {
      if (effect.card != self) return;
      console.log(
        `Effect invoked: %c"${eventName}": ${EffectType.toString(EffectEvent[eventName][0].type)}\n` +
        `%cPlayer${EffectEvent[eventName][0].card.cardPiece.pieceData.team}'s "${EffectEvent[eventName][0].card.data.name}"`,
        'color: orange',
        'color: blue'
      );
      effect.action(self, ...args);
    }
  }
}