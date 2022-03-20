import YoutubePlayer from 'phaser3-rex-plugins/plugins/youtubeplayer';
import { playlistStore, playlistStore2 } from '../stores/PlaylistStore';
import { subscribeKey } from 'valtio/utils'
import { proxy, subscribe, snapshot } from 'valtio/vanilla'


interface Props {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    config?: any; 
  }


export class LilYoutubePlayer extends YoutubePlayer { 
    private current;

    constructor({ scene, x, y, width, height, config }: Props) {
        super(scene, x, y, width, height, config);
        scene.add.existing(this);
      
    }

    private handlePlaylistStore(url){
        // console.log('youtube url game state is mutated', url);
        // this.load(url)
        // this.play()
        // console.log('playlist2 current', current);
        // console.log('playlistStore2', playlistStore2.get.current());
    }

   
    
}