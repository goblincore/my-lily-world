import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RoomAvailable } from 'colyseus.js'
import { RoomType } from '../../../types/Rooms'

interface RoomInterface extends RoomAvailable {
  name?: string
}

/**
 * Colyseus' real time room list always includes the public lobby so we have to remove it manually.
 */
const isCustomRoom = (room: RoomInterface) => {
  return room.name === RoomType.CUSTOM
}

export const roomSlice = createSlice({
  name: 'room',
  initialState: {
    lobbyJoined: false,
    roomJoined: false,
    roomId: '',
    roomName: '',
    roomDescription: '',
    availableRooms: new Array<RoomAvailable>(),
    playList: new Array<any>(),
    currentDj: null,
    currentPlaybackTime: 0,
  },

  reducers: {
    setCurrentDj: (state, action: PayloadAction<any>) => {
      console.log('setCurrentDj', setCurrentDj);
      state.currentDj = action.payload
    },
    setLobbyJoined: (state, action: PayloadAction<boolean>) => {
      state.lobbyJoined = action.payload
    },
    setRoomJoined: (state, action: PayloadAction<boolean>) => {
      state.roomJoined = action.payload
    },
    setPlaylistItems: (state, action: PayloadAction<any>) => {
      console.log('setPlaylistItems action playload', action?.payload);
      state.playList = [ action?.payload, ...state.playList];
      console.log('state.playlist', state.playList);
    },
    setJoinedRoomData: (
      state,
      action: PayloadAction<{ id: string; name: string; description: string, playlistItems: any, currentDj: any, currentPlaybackTime: any }>
    ) => {

      console.log('setJoinedRoomData', state, 'action', action);
      state.roomId = action.payload.id
      state.roomName = action.payload.name
      state.roomDescription = action.payload.description
      state.playList = action.payload.playlistItems
      state.currentDj = action.payload.currentDj
      state.currentPlaybackTime = action.payload.currentPlaybackTime

    },
    setAvailableRooms: (state, action: PayloadAction<RoomAvailable[]>) => {
      state.availableRooms = action.payload.filter((room) => isCustomRoom(room))
    },
    addAvailableRooms: (state, action: PayloadAction<{ roomId: string; room: RoomAvailable }>) => {
      if (!isCustomRoom(action.payload.room)) return
      const roomIndex = state.availableRooms.findIndex(
        (room) => room.roomId === action.payload.roomId
      )
      if (roomIndex !== -1) {
        state.availableRooms[roomIndex] = action.payload.room
      } else {
        state.availableRooms.push(action.payload.room)
      }
    },
    removeAvailableRooms: (state, action: PayloadAction<string>) => {
      state.availableRooms = state.availableRooms.filter((room) => room.roomId !== action.payload)
    },
  },
})

export const {
  setLobbyJoined,
  setRoomJoined,
  setJoinedRoomData,
  setAvailableRooms,
  addAvailableRooms,
  removeAvailableRooms,
  setPlaylistItems,
  setCurrentDj,
} = roomSlice.actions

export default roomSlice.reducer
