import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'

type Payload = {
  client: Client
  musicBoothId: string
}

export class MusicBoothAddUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, musicBoothId } = data
    const musicBooth = this.room.state.musicBooths.get(musicBoothId)
    const clientId = client.sessionId

    if (!musicBooth || musicBooth.connectedUser.has(clientId)) return
    musicBooth.connectedUser.add(clientId)
  }
}

export class MusicBoothRemoveUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, musicBoothId } = data
    const musicBooth = this.state.musicBooths.get(musicBoothId)

    if (musicBooth.connectedUser.has(client.sessionId)) {
      musicBooth.connectedUser.delete(client.sessionId)
    }
  }
}
