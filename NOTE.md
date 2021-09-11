# DEV Note

## TODO (short term):

- [x] Implement Sprite loading
  - [ ] Implement lazy Sprite loading (maybe not?)
- [x] Implement Sprite animation
  - [ ] Implement Sprite action animation (attack, take damage, death, etc...)
- [x] Implement Tile state
- [x] Implement Basic Turn
- [x] Implement Basic Movement
  - [x] Implement movement tween
- [x] Implement Attack
- [x] Implement Counter Attack
- [ ] Implement Face-down spawn
- [ ] Implement Effect (partially done)
- [ ] Implement Effect Chain
- [ ] Implement UI
  - [x] Detailed Card Info
  - [x] Hand (improvement is needed)
  - [ ] End Turn
  - [ ] Commander HP
  - [ ] Mana
- [x] Implement Hand
- [x] Implement Card Placement
- [ ] Implement Card data base
- [ ] Implement Deck
- [ ] Implement Graveyard
- [ ] Implement Banish Zone
- [x] Implement Undo
- [ ] Upgrade mouse input (seperate right / left click)
  - [ ] Implement context menu

## TODO (long term):

- [ ] Add original arts
- [ ] Implement multiplayer
  - [ ] Add spectator mode
  - [ ] Add game replay

## Reminder

**Attack**  
`turn player` **Select:** Attack target ->  
`turn player` **Effect:** On Attack ->  
`turn player` Deal damage (Attack) ->  
`turn player` **Effect:** On Deal Damage ->  
`opps player` Take damage ->  
`opps player` **Effect:** On Take Damage ->  
`turn player` Tap ->  
`opps player` **Choose:** Counter attack ->  
`opps player` **Effect:** On Counter Attack ->  
`opps player` Deal damage (Counter attack) ->  
`opps player` **Effect:** On Deal Damage ->  
`turn player` **Effect:** On Take Damage ->  
`opps player` Tap

## Phaser ref

**Depth sorting:**  
https://phaser.discourse.group/t/container-sorting/4479

**Custom font:**  
https://www.webtips.dev/webtips/phaser/custom-fonts-in-phaser3

**Card flip:**  
https://rexrainbow.github.io/phaser3-rex-notes/docs/site/perspective-card/#live-demos

**Lights:**  
https://labs.phaser.io/edit.html?src=src/game%20objects\lights\draw%20light.js  

**Skew sprite:**  
https://phaser.io/examples/v3/view/game-objects/dom-element/skew

**Legends of Runeterra made with pahser:**  
https://www.emanueleferonato.com/2020/05/22/draw-a-card-from-your-hand-like-in-legends-of-runeterra-mobile-version/

**Loading screen:**  
https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/

**Tween:**  
https://phaser.io/examples/v3/view/physics/arcade/tween-velocity

**Card flip:**  
https://youtu.be/u1wNToPU8UY

**Camera shake:**  
https://phaser.io/examples/v3/view/camera/shake

**Text input field:**  
https://phasergames.com/phaser-3-input-text-form-ui-part-1/

## Duelyst ref

**Duelyst Art:**  
https://www.artstation.com/duelyst  
https://www.behance.net/gallery/72142165/Duelyst-Assets  
http://kirkbarnett.blogspot.com/p/sketch-page-pros-loose-and-open-minded.html  

**Duelyst Cards:**  
https://duelspot.com/cards/

**Duelyst Maps:**  
https://imgshare.io/album/duelyst-battlemaps.xB6t

## Inspiring images

![](https://cdnb.artstation.com/p/assets/images/images/013/705/071/large/danny-huynh-danny-huynh-duelyst-redstonebattlemaplow.jpg)
