import { proxy } from 'valtio/vanilla';
import { watch } from 'valtio/utils'
import { createStore,  } from '@udecode/zustood';


export const playlistStore = proxy(new Array<any>() )

export const playlistStore2 = createStore('playlist')({
    current: '',
    playerId:'',
    playlistItems: new Array<any>()
})

 
const stop = watch((get) => {
    console.log('state has changed to', get(playlistStore)) // auto-subscribe on use
  })
  