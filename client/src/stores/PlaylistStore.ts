import { proxy, useSnapshot } from 'valtio';
import { watch } from 'valtio/utils'

export const playlistStore = proxy({ url: 'Csev9IUatzc' })

const stop = watch((get) => {
    console.log('state has changed to', get(playlistStore)) // auto-subscribe on use
  })
  