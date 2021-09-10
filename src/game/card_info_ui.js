class CardInfoUI {
  // TODO: this must be diffrent for each card type
  // make it composable

  static width = 350;
  static height = 500;

  static bg = null;
  static cardName = null;
  static cardStats = null;
  static visual = null;

  static init() {
    CardInfoUI.bg = Game.spawn.rectangle(
      0, 0,
      CardInfoUI.width, CardInfoUI.height,
      0x182236
    )
      .setOrigin(0.5, 0);

    CardInfoUI.cardName = Game.spawn.text(
      0, 30,
      'card name',
      {
        font: '20px Play',
        align: 'center',
      }
    ).setOrigin(0.5, 1);

    CardInfoUI.cardStats = Game.spawn.text(
      -CardInfoUI.width / 2 + 10, 60,
      `⛨: - ⚔: -`,
      {
        font: '18px Play',
        align: 'left'
      }).setOrigin(0, 1);

    CardInfoUI.cardDesc = Game.spawn.text(
      -CardInfoUI.width / 2 + 10, 70,
      `card description`,
      {
        font: '18px Play',
        align: 'left',
        wordWrap: { width: CardInfoUI.width - 10 }
      }).setOrigin(0, 0);

    CardInfoUI.visual = Game.spawn.group().addMultiple([
      CardInfoUI.bg,
      CardInfoUI.cardName,
      CardInfoUI.cardStats,
      CardInfoUI.cardDesc,
    ]);

    // set position
    CardInfoUI.visual.incXY(-775, -300);

    // add to layer
    Game.addToWorld(Layer.UI, CardInfoUI.visual.getChildren());

    // hide
    CardInfoUI.hide();
  }

  static show() {
    CardInfoUI.visual.setVisible(true);
  }
  static hide() {
    CardInfoUI.visual.setVisible(false);
  }
  static updateInfo(card) {
    CardInfoUI.cardName.setText(card.data.name);
    CardInfoUI.cardDesc.setText(card.data.desc);

    const pieceData = card.cardPiece.pieceData;
    CardInfoUI.cardStats.setText(`⛨: ${pieceData.health} ⚔: ${pieceData.attack}`);
  }
}