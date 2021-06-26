// Effect type
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
    // add more...
}

class EffectAction {
    static onDealDamage() {
        // show all avaliable cards make them selectable
        for (let fx of Effect.onDealDamage) {
            console.log(fx);
        }
    }
    static onTakeDamage() {
        // show all avaliable cards make them selectable
        for (let fx of Effect.onTakeDamage) {
            console.log(fx);
        }
    }
}