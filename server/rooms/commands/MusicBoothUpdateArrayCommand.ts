import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'
import { PlaylistItem } from '../schema/OfficeState'

type Payload = {
  client: Client
  musicBoothId?: string
  content: string
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

export class MusicBoothStartPlaySongUserCommand extends Command<IOfficeState, Payload> {
    execute(data: Payload){
        const playlist  = this.room.state.playlistItems;
        // console.log('music booth start play song user command data', data);
        const { content } = data;
        console.log('data content', content);
        if ( playlist.length >= 100)  playlist.shift()
  
        const newPlaylistItem = new PlaylistItem();

        newPlaylistItem.id = content.content,
        // newMessage.content = content
        playlist.push(newPlaylistItem);

    }
}

export class MusicBoothRemoveUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, musicBoothId } = data
    const musicBooth = this.state.musicBooths.get(musicBoothId)
    console.log('MUSIC BOOTH REMOVE USER', client);
    console.log('musicBoothId', musicBoothId);

    console.log('musicBooth', musicBooth);

    if (musicBooth?.connectedUser.has(client.sessionId)) {
      musicBooth.connectedUser.delete(client.sessionId)
    }
  }
}


