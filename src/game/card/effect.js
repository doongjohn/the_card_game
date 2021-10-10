// TODO: make effect system
// Some action does not start the chain

// Effect execution order
// MandatoryTrigger ->
// Trigger ->
// Quick
// My main phase:
// Activated

// Event can be stacked

class EffectType {
  static Activated = 0
  static MandatoryTrigger = 1
  static Trigger = 2
  static Quick = 3
  static Continues = 4 // Continues effects only executes when the effect owning card is on the board
  static Lingering = 5

  static toString(num) {
    // NOTE: this may change when the javascript gets updated
    return Object.getOwnPropertyNames(EffectType)[num + 4]
  }
}

class EffectChain {
  // TODO: make effect chain
  // if you add an effect to a chain
  // it will be added to the end
  // if the chain is complete (no new effect is added)
  // it will execute effects in chain in reversed order (end --> start)
  static effects = []
}

class Effect {
  constructor(type, card, when, action) {
    this.type = type
    this.card = card
    this.when = when
    this.action = action
  }
}

class EffectEvent {
  // TODO: use linked list
  static onAttack = []               // args: self, target
  static onCounterAttack = []        // args: self, target

  static onDealDamage = []           // args: self, target
  static onDealLethalDamage = []     // TODO: args: self, target

  static onTakeDamage = []           // args: self, attacker
  static onTakeLethalDamage = []     // TODO: args: self, attacker

  static find(effect) {
    return EffectEvent[effect.when].indexOf(effect)
  }
  static add(effect) {
    EffectEvent[effect.when].push(effect)
  }
  static remove(effect) {
    EffectEvent[effect.when].splice(EffectEvent.find(effect), 1)
  }
  static invoke(when, self, ...args) {
    // TODO: make user selects the order of execution
    // reorderable ui
    for (let effect of EffectEvent[when]) {
      // check self
      if (effect.card != self)
        continue

      console.log(
        `Effect invoked: %c"${when}": ${EffectType.toString(effect.type)}\n` +
        `%cPlayer${effect.card.cardPiece.pieceData.team}'s "${effect.card.data.name}"`,
        'color: orange',
        'color: blue'
      )
      effect.action(...args)
    }
  }
  static invokeAll(when, ...args) {
    // TODO: make user selects the order of execution
    // reorderable ui
    for (let effect of EffectEvent[when]) {
      console.log(
        `Effect invoked: %c"${when}": ${EffectType.toString(effect.type)}\n` +
        `%cPlayer${effect.card.cardPiece.pieceData.team}'s "${effect.card.data.name}"`,
        'color: orange',
        'color: blue'
      )
      effect.action(...args)
    }
  }
}

class EffectData {
  constructor() {
    this.effects = []
  }
  removeAll() {
    for (let effect of this.effects) {
      EffectEvent.remove(effect)
    }
  }
}