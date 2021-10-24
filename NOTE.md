# Note

## Working on

- refactoring tile.js, tile_state.js
- refactoring cmd.js
- improve fsm
- implement match phase

## TODO

- [x] Implement Sprite loading
  - [x] Implement lazy Sprite loading (maybe not?)
- [x] Implement Sprite animation
  - [ ] Implement Sprite action animation (attack, take damage, death, etc...)
- [x] Implement Tile state
- [x] Implement Basic Turn
- [x] Implement Basic Movement
  - [x] Implement movement tween
- [ ] Implement match phase
- [x] Implement Attack
- [x] Implement Counter Attack
- [ ] Implement Face-down spawn
- [ ] Implement Effect (partially done)
- [ ] Implement Effect Chain
- [ ] Implement UI
  - [x] Hand (improvement is needed)
  - [ ] End Turn
- [x] Implement Hand
- [x] Implement Card Placement
- [ ] Implement Card Zones
- [x] Implement Undo
  - [ ] Refactor undo function
- [ ] Implement Log

## TODO (long term)

- [ ] Add original arts
- [ ] Implement multiplayer
  - [ ] Add spectator mode
  - [ ] Add game replay

## Reminder

### Combat phase

`Turn P` **Select** Attack target ➜\
`Turn P` **Effect** On Attack ➜\
`Turn P` Deal damage (Attack) ➜\
`Turn P` **Effect** On Deal Damage ➜\
\
`Opps P` Take damage ➜\
`Opps P` **Effect** On Take Damage ➜\
\
`Turn P` Tap ➜\
\
`Opps P` **Effect** On Counter Attack ➜\
`Opps P` Deal damage (Counter attack) ➜\
`Opps P` **Effect** On Deal Damage ➜\
\
`Turn P` **Effect** On Take Damage

## Phaser 3 reference

**Depth sorting:**\
<https://phaser.discourse.group/t/container-sorting/4479>

**Custom font:**\
<https://www.webtips.dev/webtips/phaser/custom-fonts-in-phaser3>

**Card flip:**\
<https://rexrainbow.github.io/phaser3-rex-notes/docs/site/perspective-card/#live-demos>

**Lights:**\
<https://labs.phaser.io/edit.html?src=src/game%20objects\lights\draw%20light.js>

**Skew sprite:**\
<https://phaser.io/examples/v3/view/game-objects/dom-element/skew>

**Legends of Runeterra made with pahser:**\
<https://www.emanueleferonato.com/2020/05/22/draw-a-card-from-your-hand-like-in-legends-of-runeterra-mobile-version/>

**Loading screen:**\
<https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/>

**Tween:**\
<https://phaser.io/examples/v3/view/physics/arcade/tween-velocity>

**Card flip:**\
<https://youtu.be/u1wNToPU8UY>

**Camera shake:**\
<https://phaser.io/examples/v3/view/camera/shake>

**Text input field:**\
<https://phasergames.com/phaser-3-input-text-form-ui-part-1/>

**Bitmap Mask:**\
<https://phaser.io/examples/v3/search?search=mask>

## Duelyst reference

**Duelyst Cards:**\
<https://duelspot.com/cards/>

**Duelyst Maps:**\
<https://imgshare.io/album/duelyst-battlemaps.xB6t>

**Duelyst Art:**\
<https://www.artstation.com/duelyst>\
<https://www.behance.net/gallery/72142165/Duelyst-Assets>\
<http://kirkbarnett.blogspot.com/p/sketch-page-pros-loose-and-open-minded.html>\
<https://github.com/Duelers/resources/tree/master/resources>

## Inspiring images

![img](https://jolstatic.fr/www/captures/3593/4/127794.png)
