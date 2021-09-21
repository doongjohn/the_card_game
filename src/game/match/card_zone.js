class CardZone {
  constructor() {
    this.cards = []
  }
  shuffle(count) {
    shuffleArray(this.cards, count)
  }
  length() {
    return this.cards.length
  }
  high() {
    return Math.max(this.cards.length - 1, 0)
  }
  firstCard() {
    return this.cards[0]
  }
  lastCard() {
    return this.cards[this.high()]
  }

  /**
   * @param {{source: CardZone, sourceIndex: number, target: CardZone, targetIndex: number}}
   * @returns {Card}
   */
  static moveCard({ source, sourceIndex, target, targetIndex } = {}) {
    let card = source.cards[sourceIndex]
    target.cards.splice(targetIndex, 0, card)
    source.cards.splice(sourceIndex, 1)
    return card
  }
}


class CardZonePlayer {
  static list = [
    "deck",
    "manaDeck",
    "extraDeck",
    "mana",
    "hand",
    "gaveyard",
    "banish",
    "limbo",
  ]

  constructor() {
    for (let zone of CardZonePlayer.list) {
      this[zone] = new CardZone()
    }
  }
}

class UndoCardZonePlayer {
  constructor() {
    this.player1 = {}
    this.player2 = {}
    for (let zone of CardZonePlayer.list) {
      this.player1[zone] = [...Match.player1.cardZones[zone].cards]
      this.player2[zone] = [...Match.player2.cardZones[zone].cards]
    }
  }
  undo() {
    for (let zone of CardZonePlayer.list) {
      Match.player1.cardZones[zone].cards = [...this.player1[zone]]
      Match.player2.cardZones[zone].cards = [...this.player2[zone]]
    }
  }
}


class CardZoneBoard {
  static permanents = new CardZone()
  // static spells = new CardZone()
}

class UndoCardZoneBoard {
  constructor() {
    this.permanents = [...CardZoneBoard.permanents.cards]
    // this.spells = [...CardZoneBoard.spells.cards]

    this.permanentData = []
    this.permanentPieceData = []
    for (let card of CardZoneBoard.permanents.cards) {
      this.permanentData.push(card ? { index: card.data.index, owner: card.data.owner } : null)
      this.permanentPieceData.push(card ? card.cardPiece.pieceData.clone() : null)
    }
  }
  undo() {
    // CardZoneBoard.spells.cards = [...this.spells]

    for (const i in CardZoneBoard.permanents.cards) {
      const owner = this.permanentData[i]?.owner
      const pos = toCoord(i)

      Board.removePermanentAt(pos.x, pos.y)
      if (!owner) continue

      const index = this.permanentData[i].index
      const data = this.permanentPieceData[i]
      const card = index == -1 ? owner.commander : owner.allCards[index]

      Board.setPermanentAt(pos.x, pos.y, card)

      card.cardPiece.pieceData = data
      card.cardPiece.faceDownRaw(data.faceDowned)
      card.cardPiece.tap(data.tapped)
      card.cardPiece.updateVisual()
    }
  }
}