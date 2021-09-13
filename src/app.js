function initPage() {
  // disable HTML Context Menu (right click menu)
  document.body.oncontextmenu = event => { event.preventDefault() }
}

function initGame(startScene) {
  return new Phaser.Game({
    type: Phaser.WebGL,
    width: 1920,
    height: 1080,
    backgroundColor: '#eeeeee',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pipeline: {
      'Gray': GrayScalePipeline
    },
    scene: startScene
  })
}

function main() {
  initPage()
  const game = initGame(new MainScene())
}

main()
