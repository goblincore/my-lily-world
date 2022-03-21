import { Schema, ArraySchema, SetSchema, MapSchema, type } from '@colyseus/schema'
import {
  IPlayer,
  IOfficeState,
  IComputer,
  IWhiteboard,
  IMusicBooth,
  IChatMessage,
  IPlaylistItem,
} from '../../../types/IOfficeState'
import Queue from '../Queue';

export class PlaylistItem extends Schema implements IPlaylistItem {
  @type('string') id = ''
  @type('string') userId = ''
  @type('string') currentTime = ''
  @type('string') length = ''
  @type('string') name = ''
}

export class Player extends Schema implements IPlayer {
  @type('string') name = ''
  @type('number') x = 705
  @type('number') y = 500
  @type('string') anim = 'adam_idle_down'
  @type('boolean') readyToConnect = false
  @type('boolean') videoConnected = false
  @type([PlaylistItem]) userPlaylist = []
  @type('boolean') isCurrentDj = false
}

export class Computer extends Schema implements IComputer {
  @type({ set: 'string' }) connectedUser = new SetSchema<string>()
}

export class Whiteboard extends Schema implements IWhiteboard {
  @type('string') roomId = getRoomId()
  @type({ set: 'string' }) connectedUser = new SetSchema<string>()
}

export class ChatMessage extends Schema implements IChatMessage {
  @type('string') author = ''
  @type('number') createdAt = new Date().getTime()
  @type('string') content = ''
}


export class MusicBooth extends Schema implements IMusicBooth {
  @type('string') roomId = getRoomId()
  @type({ set: 'string' }) connectedUser = new SetSchema<string>()
}

export class OfficeState extends Schema implements IOfficeState {
  @type({ map: Player })
  players = new MapSchema<Player>()

  @type({ map: Computer })
  computers = new MapSchema<Computer>()

  @type({ map: Whiteboard })
  whiteboards = new MapSchema<Whiteboard>()

  @type({ map: MusicBooth })
  musicBooths = new MapSchema<MusicBooth>()

  @type([ChatMessage])
  chatMessages = new ArraySchema<ChatMessage>()

  @type([PlaylistItem])
  playlistItems = new ArraySchema<any>()

  @type([Player])
  djQueueList = new ArraySchema<any>()

  @type(PlaylistItem)
  currentPlayingItem = new PlaylistItem()

  @type('number')
  currentPlaybackTime = 0

  @type('string')
  currentDjId = ''
}



export const musicBoothIds = new Set<string>()
export const whiteboardRoomIds = new Set<string>()
export const playlistIds = new Set<string>()
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const charactersLength = characters.length

function getRoomId() {
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  if (!whiteboardRoomIds.has(result)) {
    whiteboardRoomIds.add(result)
    return result
  } else {
    console.log('roomId exists, remaking another one.')
    getRoomId()
  }

  if (!musicBoothIds.has(result)) {
    musicBoothIds.add(result)
    return result
  } else {
    console.log('musicbooth roomId exists, remaking another one.')
    getRoomId()
  }
}
