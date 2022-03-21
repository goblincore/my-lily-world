import Phaser from 'phaser'

// import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'
import MusicBooth from '../items/MusicBooth'
import VendingMachine from '../items/VendingMachine'
import {  LilYoutubePlayer } from "../items/MediaPlayer";
import '../characters/MyPlayer'
import '../characters/OtherPlayer'
import MyPlayer from '../characters/MyPlayer'
import OtherPlayer from '../characters/OtherPlayer'
import PlayerSelector from '../characters/PlayerSelector'
import Network from '../services/Network'
import { IPlayer } from '../../../types/IOfficeState'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { ItemType } from '../../../types/Items'

import store from '../stores'
import { openPlaylistDialogue } from '../stores/UserStore'
import { setFocused, setShowChat } from '../stores/ChatStore'
import { proxy, subscribe, snapshot } from 'valtio/vanilla'
import { playlistStore } from '../stores/PlaylistStore'


export default class Game extends Phaser.Scene {
  network!: Network
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keyE!: Phaser.Input.Keyboard.Key
  private keyR!: Phaser.Input.Keyboard.Key
  private map!: Phaser.Tilemaps.Tilemap
  myPlayer!: MyPlayer
  private timerTest: Phaser.Time.TimerEvent
  private playerSelector!: Phaser.GameObjects.Zone
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayerMap = new Map<string, OtherPlayer>()
  computerMap = new Map<string, Computer>()
  private whiteboardMap = new Map<string, Whiteboard>()
  private musicBoothMap = new Map<string, MusicBooth>()
  private youtubePlayer?: LilYoutubePlayer
  private youtubeUrl: string = ''
  private currentDj?: string | null = null;
 
  

  constructor() {
    super('game')
  }

  registerKeys() {
    this.cursors = this.input.keyboard.createCursorKeys()
    // maybe we can have a dedicated method for adding keys if more keys are needed in the future
    this.keyE = this.input.keyboard.addKey('E')
    this.keyR = this.input.keyboard.addKey('R')
    this.input.keyboard.disableGlobalCapture()
    this.input.keyboard.on('keydown-P', (event) => {
      store.dispatch(openPlaylistDialogue('true'))
    })
    this.input.keyboard.on('keydown-ENTER', (event) => {
      store.dispatch(setShowChat(true))
      store.dispatch(setFocused(true))
    })
    this.input.keyboard.on('keydown-ESC', (event) => {
      store.dispatch(setShowChat(false))
    })
  }

  disableKeys() {
    this.input.keyboard.enabled = false
  }

  enableKeys() {
    this.input.keyboard.enabled = true
  }

  create(data: { network: Network }) {
    if (!data.network) {
      throw new Error('server instance missing')
    } else {
      this.network = data.network
    }

    createCharacterAnims(this.anims)

    this.map = this.make.tilemap({ key: 'tilemap' })
    const FloorAndGround = this.map.addTilesetImage('FloorAndGround', 'tiles_wall')

    const groundLayer = this.map.createLayer('Ground', FloorAndGround)
    groundLayer.setCollisionByProperty({ collides: true })

    // debugDraw(groundLayer, this)

    this.myPlayer = this.add.myPlayer(705, 500, 'adam', this.network.mySessionId)
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

   
     // import music booth objects from Tiled map to Phaser
     const musicBooths = this.physics.add.staticGroup({ classType: MusicBooth })
     const musicBoothLayer = this.map.getObjectLayer('MusicBooth')
     musicBoothLayer.objects.forEach((obj, i) => {
       const item = this.addObjectFromTiled(
         musicBooths,
         obj,
         'musicBooths',
         'musicBooth'
       ) as MusicBooth
       const id = `${i}`
       item.id = id
       this.musicBoothMap.set(id, item)
     })


    // import other objects from Tiled map to Phaser
    // this.addGroupFromTiled('Wall', 'tiles_wall', 'FloorAndGround', false)
    // this.addGroupFromTiled('Objects', 'office', 'Modern_Office_Black_Shadow', false)
    // this.addGroupFromTiled('ObjectsOnCollide', 'office', 'Modern_Office_Black_Shadow', true)
    // this.addGroupFromTiled('GenericObjects', 'generic', 'Generic', false)
    // this.addGroupFromTiled('GenericObjectsOnCollide', 'generic', 'Generic', true)
    // this.addGroupFromTiled('Basement', 'basement', 'Basement', true)

    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    this.cameras.main.zoom = 1.5
    this.cameras.main.startFollow(this.myPlayer, true)

    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], groundLayer)
    // this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], vendingMachines)

    this.physics.add.overlap(
      this.playerSelector,
      [musicBooths],
      this.handleItemSelectorOverlap,
      undefined,
      this
    )

    this.timerTest = this.time.addEvent({
      callback: this.timerEvent,
      callbackScope: this,
      delay: 100, // 1000 = 1 second
      loop: true
    })

    this.physics.add.overlap(
      this.myPlayer,
      this.otherPlayers,
      this.handlePlayersOverlap,
      undefined,
      this
    )

    // Youtube embed test
    const youtubePlayerProps = {
      scene: this,
      x: 800,
      y: 180,
      width: 240,
      height: 180,
      controls: false,
      modestBranding: true,

    }
    this.youtubePlayer = new LilYoutubePlayer({...youtubePlayerProps});
    this.youtubePlayer.alpha = 0;
    const network = this.network;
    this.youtubePlayer.on('statechange', function (player) {
      console.log('video player state change'
      , player.videoStateString);
      network.playbackStateChange(player.videoStateString);
   })



    subscribe(playlistStore, () => {
      console.log('game subscribe playlist store');
    //   this.youtubePlayer?.load(playlistStore.url);
    //   if(this.youtubePlayer) {
    //     console.log('this.youtubePlayertime', this.youtubePlayer.playbackTime);
    //   this.youtubePlayer.alpha = 1;
    
    // }
   
    //   this.youtubePlayer?.play()
      // this.network.startMusicShare(playlistStore.url);
    })

  

    // register network event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
    this.network.onItemUserAdded(this.handleItemUserAdded, this)
    this.network.onItemUserRemoved(this.handleItemUserRemoved, this)
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
    this.network.onStartMusicShare(this.handleStartMusicShare, this)
    
  }

  public timerEvent(): void {
    if(this.youtubePlayer){
       
    }
    if(this.myPlayer.playerId === this.currentDj && this.youtubePlayer?.isPlaying ){
      console.log('this.myPlayer.playerId',this.myPlayer.playerId );
      this.network.setCurrentPlaybackTime(this.myPlayer.playerId, this.youtubePlayer.playbackTime);
    } else {
      
    }
    // Create your new object here.
  }

  private handleItemSelectorOverlap(playerSelector, selectionItem) {
    const currentItem = playerSelector.selectedItem as Item
    // currentItem is undefined if nothing was perviously selected
    if (currentItem) {
      // if the selection has not changed, do nothing
      if (currentItem === selectionItem || currentItem.depth >= selectionItem.depth) {
        return
      }
      // if selection changes, clear pervious dialog
      if (this.myPlayer.playerBehavior !== PlayerBehavior.SITTING) currentItem.clearDialogBox()
    }

    // set selected item and set up new dialog
    playerSelector.selectedItem = selectionItem
    selectionItem.onOverlapDialog()
  }

  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5
    const actualY = object.y! - object.height! * 0.5
    const obj = group
      .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
      .setDepth(actualY)
    return obj
  }

  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean
  ) {
    const group = this.physics.add.staticGroup()
    const objectLayer = this.map.getObjectLayer(objectLayerName)
    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5
      const actualY = object.y! - object.height! * 0.5
      group
        .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
        .setDepth(actualY)
    })
    if (this.myPlayer && collidable)
      this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], group)
  }

  // function to add new player to the otherPlayer group
  private handlePlayerJoined(newPlayer: IPlayer, id: string) {
    const otherPlayer = this.add.otherPlayer(newPlayer.x, newPlayer.y, 'adam', id, newPlayer.name)
    this.otherPlayers.add(otherPlayer)
    this.otherPlayerMap.set(id, otherPlayer)
    if(this.myPlayer.playerId === this.currentDj && this.youtubePlayer?.isPlaying){
      this.network.setCurrentPlaybackTime(this.myPlayer.playerId, this.youtubePlayer.playbackTime)
    }
  }

  // function to remove the player who left from the otherPlayer group
  private handlePlayerLeft(id: string) {
    if (this.otherPlayerMap.has(id)) {
      const otherPlayer = this.otherPlayerMap.get(id)
      if (!otherPlayer) return
      this.otherPlayers.remove(otherPlayer, true, true)
      this.otherPlayerMap.delete(id)
    }
  }

  private handleMyPlayerReady() {
    this.myPlayer.readyToConnect = true
    console.log('handleMyPlayeRReady');
    const roomState =  store.getState().room;
      if(roomState.currentDj && roomState.currentPlaybackItem){
          console.log('room store', roomState)
          let setTime = false;
          this.youtubePlayer?.load(roomState.currentPlaybackItem, true);
          this.youtubePlayer?.on('playing', function(player){
            if(!setTime){
            player?.setPlaybackTime(roomState.currentPlaybackTime);
            setTime = true
            }

          })
        console.log('currentPlaybackTime', roomState.currentPlaybackTime)
          if(this.youtubePlayer) {
            this.youtubePlayer.alpha = 1;
            this.youtubePlayer.blendMode = Phaser.BlendModes.SCREEN;
        
        
          }
      }
    
  
  }

  private handleMyVideoConnected() {
    this.myPlayer.videoConnected = true
  }

  // function to update target position upon receiving player updates
  private handlePlayerUpdated(field: string, value: number | string, id: string) {
    const otherPlayer = this.otherPlayerMap.get(id)
    otherPlayer?.updateOtherPlayer(field, value)
  }

  private handlePlayersOverlap(myPlayer, otherPlayer) {
    otherPlayer.makeCall(myPlayer, this.network?.webRTC)
  }

  private handleItemUserAdded(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.addCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.addCurrentUser(playerId)
    } else if (itemType === ItemType.MUSICBOOTH) {
      const musicBooth= this.musicBoothMap.get(itemId)
      musicBooth?.addCurrentUser(playerId)
    }
  }

  private handleItemUserRemoved(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.removeCurrentUser(playerId)
    } else if (itemType === ItemType.MUSICBOOTH) {
      const musicBooth = this.musicBoothMap.get(itemId)
      console.log('REMOVE USER FROM MUSICBOOTH');
      musicBooth?.removeCurrentUser(playerId)
    }else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.removeCurrentUser(playerId)
    }
  }

  private handleChatMessageAdded(playerId: string, content: string) {
    console.log('handleChatMessageAdded');
    const otherPlayer = this.otherPlayerMap.get(playerId)
    otherPlayer?.updateDialogBubble(content)
  }


  private handleStartMusicShare(playerId: string, content: any){
    console.log( 'in game startMusic playing content!!', content, 'playerId', playerId);
    const url = content.id;
    this.youtubePlayer?.load(url, true)
    if(this.youtubePlayer) {
      this.youtubePlayer.alpha = 1;
      this.youtubePlayer.blendMode = Phaser.BlendModes.SCREEN;
  
    }

    this.currentDj = playerId;

    this.youtubePlayer?.play();
  }

  update(t: number, dt: number) {
    // if(this.youtubePlayer){
    //   console.log('this.youtubeplayer', this.youtubePlayer?.playbackTime)
    // }
   
    

    if (this.myPlayer && this.network) {
      this.playerSelector.update(this.myPlayer, this.cursors)
      this.myPlayer.update(this.playerSelector, this.cursors, this.keyE, this.keyR, this.network)
    }
  }
}
