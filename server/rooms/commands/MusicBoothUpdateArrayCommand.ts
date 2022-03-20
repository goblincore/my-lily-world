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
        const playlist  = this.room.state.playlistItems
    //    console.log('music booth start play song user command data', playlist);
        const { client, content } = data;
        // console.log('data content userId', client?.id);
        const player = this.room.state.players.get(client.sessionId);
        const userPlaylist = player.userPlaylist;
        // if ( playlist.length >= 100)  playlist.shift()
        console.log('userPlaylist?.[0]', userPlaylist?.[0]);
        // const newPlaylistItem = new PlaylistItem();

        // newPlaylistItem.id = content,
        // newPlaylistItem.userId = client.id,
        // // newMessage.content = content
        playlist.push(userPlaylist?.[0]);

    }
}

export class AddItemToUserPlaylistUserCommand extends Command<IOfficeState, Payload> {
    execute(data: Payload){
        const { client, content } = data;
        // Take payload data, get current player and add to their player playlist
        console.log('AddItemToUserPlaylistUserComand payload', data);
        const player = this.room.state.players.get(client.sessionId);
        const newPlaylistItem = new PlaylistItem();
        console.log('newPlaylistItem', newPlaylistItem);
        newPlaylistItem.id = content,
        newPlaylistItem.userId = client.id,
        console.log('player.userplaylist',  player.userPlaylist);
        player.userPlaylist.push(newPlaylistItem);
    }
}

export class MusicBoothRemoveUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, musicBoothId } = data
    const musicBooth = this.state.musicBooths.get(musicBoothId)

    console.log('musicBoothId', musicBoothId);

    console.log('musicBooth', musicBooth);

    if (musicBooth?.connectedUser.has(client.sessionId)) {
      musicBooth.connectedUser.delete(client.sessionId)
    }
  }
}


