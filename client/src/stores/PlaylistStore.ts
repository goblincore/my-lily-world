import { proxy, useSnapshot } from 'valtio';
import { watch } from 'valtio/utils'
import { createStore,  } from '@udecode/zustood';

export const playlistStore = proxy({ url: '', time: 0  })

export const playlistStore2 = createStore('playlist')({
    current: '',
    playerId:'',

})

 
const stop = watch((get) => {
    console.log('state has changed to', get(playlistStore)) // auto-subscribe on use
  })
  