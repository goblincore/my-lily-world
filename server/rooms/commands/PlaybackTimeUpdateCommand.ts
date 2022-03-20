import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'

type Payload = {
  time: number
}

export class PlaybackTimeUpdateCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { time } = data
    this.room.state.currentPlaybackTime = time;
  }
}
