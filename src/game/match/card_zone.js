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
}


class CardZonePlayer {
  /**
   * @typedef {(
   *  'deck'|
   *  'pactDeck'|
   *  'extraDeck'|
   *  'pact'|
   *  'hand'|
   *  'gaveyard'|
   *  'banish'|
   *  'limbo'|
   *  'permanents'
   * )} CardZoneList
   */
   static list = [
    'deck',
    'pactDeck',
    'extraDeck',
    'pact',
    'hand',
    'gaveyard',
    'banish',
    'limbo',
  ]

  constructor() {
    for (let zone of CardZonePlayer.list)
      this[zone] = new CardZone()
  }

  /**
   * @param {{
   *  source: CardZoneList,
   *  sourceIndex: number,
   *  target: CardZoneList,
   *  targetIndex: number
   * }}
   * @returns {Card}
   */
  moveCard({ source, sourceIndex, target, targetIndex } = {}) {
    let isSourceBoard = CardZoneBoard.list.includes(source)
    let isTargetBoard = CardZoneBoard.list.includes(target)

    let card = isSourceBoard
      ? CardZoneBoard[source].cards[sourceIndex]
      : this[source].cards[sourceIndex]

    isTargetBoard
      ? CardZoneBoard[target].cards[targetIndex] = card
      : this[target].cards.splice(targetIndex, 0, card)

    isSourceBoard
      ? CardZoneBoard[source].cards[sourceIndex] = null
      : this[source].cards.splice(sourceIndex, 1)

    return card
  }
}

class HistCardZonePlayer {
  constructor() {
    this.player1 = {}
    this.player2 = {}
    for (let zone of CardZonePlayer.list) {
      this.player1[zone] = [...Match.player1.cardZones[zone].cards]
      this.player2[zone] = [...Match.player2.cardZones[zone].cards]
    }
  }
  undo() {
    function forEachCard(card) {
      card.cardPiece.resetTeam()
      card.cardPiece.visualUpdateTeam()
      card.cardPaper.hide()
    }
    for (let zone of CardZonePlayer.list) {
      Match.player1.cardZones[zone].cards = [...this.player1[zone]]
      Match.player2.cardZones[zone].cards = [...this.player2[zone]]
      Match.player1.cardZones[zone].cards.forEach(card => forEachCard(card))
      Match.player2.cardZones[zone].cards.forEach(card => forEachCard(card))
    }
  }
}


class CardZoneBoard {
  static list = [
    'permanents',
    'spells'
  ]

  static permanents = new CardZone()
  // static spells = new CardZone()

  static init() {
    // set commanders
    CardZoneBoard.setPermanentAt(1, 3, Match.player1.commander)
    CardZoneBoard.setPermanentAt(9, 3, Match.player2.commander)
    Match.player1.commander.cardPiece.visualUpdate()
    Match.player2.commander.cardPiece.visualUpdate()
  }

  static getPermanentAt(x, y) {
    const index = tileGrid.coordToIndex(x, y)
    return index < 0 || index >= tileGrid.tiles.length ? null : CardZoneBoard.permanents.cards[index]
  }

  static setPermanentAt(x, y, card) {
    if (CardZoneBoard.getPermanentAt(x, y)) {
      console.error(`Can't set permanent here!\nCardZoneBoard.permanent: [${x}, ${y}] is already occupied`)
      return
    }
    CardZoneBoard.permanents.cards[tileGrid.coordToIndex(x, y)] = card
    card.cardPiece.setPos(x, y)
    card.cardPiece.show()
  }

  static swapPermanentAt(x, y, x2, y2) {
    let curPos = tileGrid.coordToIndex(x, y)
    let newPos = tileGrid.coordToIndex(x2, y2)
    let cards = CardZoneBoard.permanents.cards
    let card1 = cards[curPos]
    let card2 = cards[newPos]
    cards[newPos] = card1
    cards[curPos] = card2
    card1?.cardPiece?.setPos(x2, y2)
    card2?.cardPiece?.setPos(x, y)
  }

  static setPermanentPos(card, x, y) {
    let pos = card.cardPiece.pieceData.pos
    pos && CardZoneBoard.swapPermanentAt(pos.x, pos.y, x, y)
  }

  static removePermanentAt(x, y) {
    let card = CardZoneBoard.getPermanentAt(x, y)
    if (!card) return

    CardZoneBoard.permanents.cards[tileGrid.coordToIndex(x, y)] = null
    card.cardPiece.pieceData.pos = null
    card.cardPiece.hide()
  }
}

class HistCardZoneBoard {
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
    // reset board
    for (const i in CardZoneBoard.permanents.cards) {
      const pos = tileGrid.indexToCoord(i)
      CardZoneBoard.removePermanentAt(pos.x, pos.y)
    }
    // restore board state
    for (const i in CardZoneBoard.permanents.cards) {
      const owner = this.permanentInfo[i]?.owner
      if (!owner) continue

      const pos = tileGrid.indexToCoord(i)
      const cardIndex = this.permanentInfo[i].index
      const card = cardIndex == -1 ? owner.commander : owner.allCards[cardIndex]
      const pieceData = this.permanentPieceData[i]

      CardZoneBoard.setPermanentAt(pos.x, pos.y, card)
      pieceData.faceDowned || card.cardPiece.setTap(pieceData.tapped)
      card.cardPiece.setFaceDown(pieceData.faceDowned)
      card.cardPiece.pieceData = pieceData
      card.cardPiece.visualUpdate()
    }
  }
}