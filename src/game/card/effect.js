// TODO: make effect system

// Only effects can start a Chain

// Effect execution order
// TurnPlayer MandatoryTrigger -> OppsPlayer MandatoryTrigger
// TurnPlayer Trigger          -> OppsPlayer Trigger
// TurnPlayer Quick            -> OppsPlayer Quick

// At my main phase TurnPlayer can activate:
// Activated or Quick spells

// Continues: 는 발동이 되는게 아님. 그냥 적용되는 거임.

// Cost는 그 즉시 사용됨.
// 그래서 Event들이 stack 될 수 있음.
// 그 스택된 Event들의 타이밍은 Chain이 resolve 되기 전까지 유효함.
// Cost가 아닌 명시된 Effect들은 Chain이 resolve하는 동안 실행됨.
// Chain이 resolve 되는 동안에는 Continues Effect를 제외하고 아무것도 할 수 없음.

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