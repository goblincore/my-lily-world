import bcrypt from 'bcrypt'
import { Room, Client, ServerError, Delayed } from 'colyseus'
import { Dispatcher } from '@colyseus/command'
import { Player, OfficeState, Computer, Whiteboard, MusicBooth } from './schema/OfficeState'
import { Message } from '../../types/Messages'
import { IRoomData } from '../../types/Rooms'
import { whiteboardRoomIds, musicBoothIds } from './schema/OfficeState'
import PlayerUpdateCommand from './commands/PlayerUpdateCommand'
import PlayerUpdateNameCommand from './commands/PlayerUpdateNameCommand'
import {
  ComputerAddUserCommand,
  ComputerRemoveUserCommand,
} from './commands/ComputerUpdateArrayCommand'
import {
  WhiteboardAddUserCommand,
  WhiteboardRemoveUserCommand,
} from './commands/WhiteboardUpdateArrayCommand'

import {
  PlaybackTimeUpdateCommand
} from './commands/PlaybackTimeUpdateCommand'
import {
  MusicBoothAddUserCommand,
  MusicBoothRemoveUserCommand,
  MusicBoothStartPlaySongUserCommand,
  AddItemToUserPlaylistUserCommand,
} from './commands/MusicBoothUpdateArrayCommand'

import ChatMessageUpdateCommand from './commands/ChatMessageUpdateCommand'

export class SkyOffice extends Room<OfficeState> {
  private dispatcher = new Dispatcher(this)
  private name: string
  private description: string
  private password: string | null = null
  public delayedInterval!: Delayed;
  public djQueue?: any[] | [];

  async onCreate(options: IRoomData) {
    const { name, description, password, autoDispose } = options
    this.name = name
    this.description = description
    this.autoDispose = autoDispose
    this.djQueue = [];


    // // Set an interval and store a reference to it
    // // so that we may clear it later
    // this.delayedInterval = this.clock.setInterval(() => {
    //     console.log("Time now " + this.clock.elapsedTime);
    // }, 1000);

    let hasPassword = false
    if (password) {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(password, salt)
      hasPassword = true
    }
    this.setMetadata({ name, description, hasPassword })

    this.setState(new OfficeState())

    // HARD-CODED: Add 5 computers in a room
    for (let i = 0; i < 1; i++) {
      this.state.computers.set(String(i), new Computer())
    }

    // HARD-CODED: Add 3 whiteboards in a room
    // for (let i = 0; i < 3; i++) {
    //   this.state.whiteboards.set(String(i), new Whiteboard())
    // }

    // HARD-CODED: Add 3 whiteboards in a room
    for (let i = 0; i < 1; i++) {
      this.state.musicBooths.set(String(i), new MusicBooth())
    }

    // when a player connect to a computer, add to the computer connectedUser array
    this.onMessage(Message.CONNECT_TO_COMPUTER, (client, message: { computerId: string }) => {
      this.dispatcher.dispatch(new ComputerAddUserCommand(), {
        client,
        computerId: message.computerId,
      })
    })

    // when a player disconnect from a computer, remove from the computer connectedUser array
    this.onMessage(Message.DISCONNECT_FROM_COMPUTER, (client, message: { computerId: string }) => {
      this.dispatcher.dispatch(new ComputerRemoveUserCommand(), {
        client,
        computerId: message.computerId,
      })
    })

    // when a player stop sharing screen
    this.onMessage(Message.STOP_SCREEN_SHARE, (client, message: { computerId: string }) => {
      const computer = this.state.computers.get(message.computerId)
      computer.connectedUser.forEach((id) => {
        this.clients.forEach((cli) => {
          if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
            cli.send(Message.STOP_SCREEN_SHARE, client.sessionId)
          }
        })
      })
    })

    // when a player connect to a whiteboard, add to the whiteboard connectedUser array
    this.onMessage(Message.CONNECT_TO_WHITEBOARD, (client, message: { whiteboardId: string }) => {
      this.dispatcher.dispatch(new WhiteboardAddUserCommand(), {
        client,
        whiteboardId: message.whiteboardId,
      })
    })

    // when a player starts playing a song
    this.onMessage(Message.START_MUSIC_SHARE, (client, content) => {
      console.log('player initiated starting playing music command', content)
      console.log('this.server state playlist', this.state.playlistItems);
   
      this.dispatcher.dispatch(new MusicBoothStartPlaySongUserCommand(), {
        client,
        content: content.content,
      })

      const player = this.state.players.get(client.sessionId);
 
      
      const userPlaylist = player.userPlaylist;
      // if ( playlist.length >= 100)  playlist.shift()

      // broadcast to all currently connected clients except the sender (to render in-game dialog on top of the character)
      // this.broadcast(Message.START_MUSIC_SHARE, { clientId: client.sessionId, content: player.userPlaylist[0]  })
    })


    this.onMessage(Message.PLAYBACK_STATE_CHANGE, (client, message) => {
      console.log('playback state changed', message, 'client', client.id);
      if(this.state.currentDjId === client.id){

        switch (message) {
          case 'ended':
            const player = this.state.players.get(client.sessionId);
            player.userPlaylist.shift();
            this.djQueue.shift();
     
            break;
          case 'playing':
            console.log('dj playing');
          break;
          case 'unstarted':
          case 'buffering':
            console.log('dj buffering');
            // expected output: "Mangoes and papayas are $2.79 a pound."
            break;
          default:
            console.log('default');
        }
      }
    })



    // when a player connects to a music booth
    this.onMessage(Message.CONNECT_TO_MUSIC_BOOTH, (client, message: { musicBoothId: string }) => {
      console.log('add user to musc booth', client, 'musicboothId', message);
      this.dispatcher.dispatch(new MusicBoothAddUserCommand(), {
        client,
        musicBoothId: message.musicBoothId,
      })
      const player = this.state.players.get(client.sessionId);
      const queuePlayerObj = {
        userPlayist: player.userPlaylist,
        id: client.id,
      }
      if(!this.djQueue || this.djQueue?.length === 0){
        this.state.currentDjId = client.id;
        
      }
      this.djQueue.push(queuePlayerObj as never);
      console.log('playeruserplaylist', player.userPlaylist);
      if(player.userPlaylist?.length > 0){
       
      this.broadcast(Message.START_MUSIC_SHARE, { clientId: client.sessionId, content: player.userPlaylist[0]  })
      }
    })

    // when a player disconnect from a whiteboard, remove from the whiteboard connectedUser array
    this.onMessage(
      Message.DISCONNECT_FROM_WHITEBOARD,
      (client, message: { whiteboardId: string }) => {
        this.dispatcher.dispatch(new WhiteboardRemoveUserCommand(), {
          client,
          whiteboardId: message.whiteboardId,
        })
      }
    )

    // when a player disconnects from a music booth, remove the user to the musicBooth connectedUser array
    this.onMessage(
      Message.DISCONNECT_FROM_MUSIC_BOOTH,
      (client, message: { musicBoothId: string }) => {
        this.dispatcher.dispatch(new MusicBoothRemoveUserCommand(), {
          client,
          musicBoothId: message.musicBoothId,
        })
       

        this.djQueue = this.djQueue.filter(dj => dj.id !== client.id);
         console.log('this.djQueue', this.djQueue);
      }
    )

    // when receiving updatePlayer message, call the PlayerUpdateCommand
    this.onMessage(
      Message.UPDATE_PLAYER,
      (client, message: { x: number; y: number; anim: string }) => {
        this.dispatcher.dispatch(new PlayerUpdateCommand(), {
          client,
          x: message.x,
          y: message.y,
          anim: message.anim,
        })
      }
    )

    // when receiving updatePlayerName message, call the PlayerUpdateNameCommand
    this.onMessage(Message.UPDATE_PLAYER_NAME, (client, message: { name: string }) => {
      this.dispatcher.dispatch(new PlayerUpdateNameCommand(), {
        client,
        name: message.name,
      })
    })

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.READY_TO_CONNECT, (client) => {
      console.log('THIS PAYER READDY TO CONNECT', client);
      const player = this.state.players.get(client.sessionId)
      if (player) player.readyToConnect = true
    })


    this.onMessage(Message.GET_PLAYBACK_SYNC, (client) => {
      console.log('GET PLAYBACK SYNC', client);

    })

    this.onMessage(Message.SET_PLAYBACK_TIME, (client, message) => {
      // console.log('SET PLAYBACK TIME', client.id, 'time', message);
      this.dispatcher.dispatch(new PlaybackTimeUpdateCommand(), {
        time: message.time
      })
    })

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.VIDEO_CONNECTED, (client) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.videoConnected = true
    })

    // when a player disconnect a stream, broadcast the signal to the other player connected to the stream
    this.onMessage(Message.DISCONNECT_STREAM, (client, message: { clientId: string }) => {
      this.clients.forEach((cli) => {
        if (cli.sessionId === message.clientId) {
          cli.send(Message.DISCONNECT_STREAM, client.sessionId)
        }
      })
    })

    // when a player send a chat message, update the message array and broadcast to all connected clients except the sender
    this.onMessage(Message.ADD_CHAT_MESSAGE, (client, message: { content: string }) => {
      // update the message array (so that players join later can also see the message)
      this.dispatcher.dispatch(new ChatMessageUpdateCommand(), {
        client,
        content: message.content,
      })

      // broadcast to all currently connected clients except the sender (to render in-game dialog on top of the character)
      this.broadcast(
        Message.ADD_CHAT_MESSAGE,
        { clientId: client.sessionId, content: message.content },
        { except: client }
      )
    })

      // when a player send a chat message, update the message array and broadcast to all connected clients except the sender
      this.onMessage(Message.ADD_PLAYLIST_ITEM, (client, message: { url: string }) => {
        // update the message array (so that players join later can also see the message)
        console.log('ADD ITEM to user playlist content', message)
        this.dispatcher.dispatch(new AddItemToUserPlaylistUserCommand(), {
          client,
          content: message.url,
        })
  
        // broadcast to all currently connected clients except the sender (to render in-game dialog on top of the character)
        // this.broadcast(
        //   Message.ADD_PLAYLIST_ITEM,
        //   { clientId: client.sessionId, content: message.url },
        // )
      })


  }

  async onAuth(client: Client, options: { password: string | null }) {
    if (this.password) {
      const validPassword = await bcrypt.compare(options.password, this.password)
      if (!validPassword) {
        throw new ServerError(403, 'Password is incorrect!')
      }
    }
    return true
  }

  // When a new player joins, send room data

  async onJoin(client: Client, options: any) {
    console.log('ON JOIN SERVER event', client);
    if(this.state.playlistItems?.length > 0) {
      console.log('playlistitems exist', this.state.playlistItems);
    }
    this.state.players.set(client.sessionId, new Player())
    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
      description: this.description,
      playlistItems: this.state.playlistItems,
      currentDj: this.state.currentDjId,
      currentPlaybackTime: this.state.currentPlaybackTime
    })
  }

  onLeave(client: Client, consented: boolean) {
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId)
    }
    this.state.computers.forEach((computer) => {
      if (computer.connectedUser.has(client.sessionId)) {
        computer.connectedUser.delete(client.sessionId)
      }
    })
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboard.connectedUser.has(client.sessionId)) {
        whiteboard.connectedUser.delete(client.sessionId)
      }
    })
    this.state.musicBooths.forEach((musicBooth) => {
      if (musicBooth.connectedUser.has(client.sessionId)) {
        musicBooth.connectedUser.delete(client.sessionId)
      }
    })
  }

  onDispose() {
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboardRoomIds.has(whiteboard.roomId)) whiteboardRoomIds.delete(whiteboard.roomId)
    })
    this.state.musicBooths.forEach((musicBooth) => {
      if (musicBoothIds.has(musicBooth.roomId)) musicBoothIds.delete(musicBooth.roomId)
    })
     this.state.currentDjId = '';
    console.log('room', this.roomId, 'disposing...')
    // this.delayedInterval.clear()
    this.dispatcher.stop()
  }
}
