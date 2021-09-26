class CardZone {
  constructor() {
    this.cards = []
  }
  shuffle(count) {
    Array.shuffle(this.cards, count)
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

  static init() {
    // set commanders
    CardZoneBoard.setPermanentAt(1, 3, Match.player1.commander)
    CardZoneBoard.setPermanentAt(9, 3, Match.player2.commander)
  }

  static getPermanentAt(x, y) {
    const index = tileGrid.coordToIndex(x, y)
    return index < 0 || index >= tileGrid.tiles.length ? null : CardZoneBoard.permanents.cards[index]
  }

  static setPermanentAt(x, y, card) {
    if (CardZoneBoard.getPermanentAt(x, y)) {
      console.log(`Can't set permanent here! (CardZoneBoard.permanent: [${x}, ${y}] is already occupied)`)
    } else {
      CardZoneBoard.permanents.cards[tileGrid.coordToIndex(x, y)] = card
      card.cardPiece.setPos(x, y)
      card.cardPiece.show()
    }
  }

  static swapPermanentAt(x, y, x2, y2) {
    let curPos = tileGrid.coordToIndex(x, y)
    let newPos = tileGrid.coordToIndex(x2, y2)
    let cards = CardZoneBoard.permanents.cards
    let card1 = cards[curPos]
    let card2 = cards[newPos]
    cards[newPos] = card1
    cards[curPos] = card2
  }

  static removePermanentAt(x, y) {
    let card = CardZoneBoard.getPermanentAt(x, y)
    if (!card) return

    CardZoneBoard.permanents.cards[tileGrid.coordToIndex(x, y)] = null
    card.cardPiece.pieceData.pos = null
    card.cardPiece.hide() // FIXME
  }
}

class UndoCardZoneBoard {
  constructor() {
    this.permanents = [...CardZoneBoard.permanents.cards]
    this.permanentInfo = []
    this.permanentPieceData = []
    for (let card of CardZoneBoard.permanents.cards) {
      if (card) {
        this.permanentInfo.push({
          index: card.data.index,
          owner: card.data.owner
        })
        this.permanentPieceData.push(card.cardPiece.pieceData.clone())
      } else {
        this.permanentInfo.push(null)
        this.permanentPieceData.push(null)
      }
    }
  }
  undo() {
    for (const i in CardZoneBoard.permanents.cards) {
      const owner = this.permanentInfo[i]?.owner
      const pos = tileGrid.indexToCoord(i)

      CardZoneBoard.removePermanentAt(pos.x, pos.y)
      if (!owner) continue

      const index = this.permanentInfo[i].index
      const card = index == -1 ? owner.commander : owner.allCards[index]
      const pieceData = this.permanentPieceData[i]

      CardZoneBoard.setPermanentAt(pos.x, pos.y, card)
      card.cardPiece.faceDownRaw(pieceData.faceDowned)
      card.cardPiece.tap(pieceData.tapped)
      card.cardPiece.pieceData = pieceData
      card.cardPiece.updateVisual()
    }
  }
}