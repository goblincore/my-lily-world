import { Schema, ArraySchema, SetSchema, MapSchema } from '@colyseus/schema'

export interface IPlayer extends Schema {
  name: string
  x: number
  y: number
  anim: string
  readyToConnect: boolean
  videoConnected: boolean
  isCurrentDj?: boolean
  userPlaylist?: ArraySchema<IPlaylistItem>
}

export interface IComputer extends Schema {
  connectedUser: SetSchema<string>
}

export interface IWhiteboard extends Schema {
  roomId: string
  connectedUser: SetSchema<string>
}

export interface IMusicBooth extends Schema {
  roomId: string
  connectedUser: SetSchema<string>
}

export interface IChatMessage extends Schema {
  author: string
  createdAt: number
  content: string
}

export interface IPlaylistItem extends Schema {
  id: string
  currentTime: string
  length: string
  name: string
  userId: string
}

export interface IOfficeState extends Schema {
  players: MapSchema<IPlayer>
  computers: MapSchema<IComputer>
  whiteboards: MapSchema<IWhiteboard>
  musicBooths: MapSchema<IMusicBooth>
  chatMessages: ArraySchema<IChatMessage>
  playlistItems: ArraySchema<IPlaylistItem>
  currentPlaylistItem: IPlaylistItem
  currentPlaybackTime: number
}
