import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

// Redux store state
interface MusicBoothState {
  musicBoothDialogOpen: boolean
  musicBoothId: null | string
  musicBoothUrl: null | string
  urls: Map<string, string>
}

const initialState: MusicBoothState = {
  musicBoothDialogOpen: false,
  musicBoothId: null,
  musicBoothUrl: null,
  urls: new Map(),
}

export const musicBoothSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    openMusicBoothDialog: (state, action: PayloadAction<string>) => {
      state.musicBoothDialogOpen = true
      state.musicBoothId = action.payload
      const url = state.urls.get(action.payload)
      if (url) state.musicBoothUrl = url
      const game = phaserGame.scene.keys.game as Game
      game.disableKeys()
    },
    closeMusicBoothDialog: (state) => {
      const game = phaserGame.scene.keys.game as Game
      game.enableKeys()
      game.network.disconnectFromMusicBooth(state.musicBoothId!)
      state.musicBoothDialogOpen = false
      state.musicBoothId = null
      state.musicBoothUrl = null
    },
    setMusicBoothUrls: (state, action: PayloadAction<{ musicBoothId: string; roomId: string }>) => {
      state.urls.set(
        action.payload.musicBoothId,
        `https://www.tldraw.com/r/sky-office-${action.payload.roomId}` // youtube or soundcloud URL
      )
    },
  },
})

export const { openMusicBoothDialog, closeMusicBoothDialog, setMusicBoothUrls } =
  musicBoothSlice.actions

export default musicBoothSlice.reducer
