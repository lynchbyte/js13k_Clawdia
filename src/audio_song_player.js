import { CPlayer } from './audio_player_small.js';

export class SongPlayer {

  constructor(audioContext, songData) {

    this.audioContext = audioContext;
    this.songData = songData;
    this.currentSongNode = null;

  }

  initSong() {

    const songPlayer = new CPlayer();
    songPlayer.init(this.songData);

    let done = 0;

    while (done < 1) {// 2 channels

      done = songPlayer.generate();

    }

    const audioBuffer = songPlayer.createAudioBuffer(this.audioContext);

    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;

    sourceNode.connect(this.audioContext.destination);
    //sourceNode.start(this.audioContext.currentTime); // THREE does this

    this.currentSongNode = sourceNode;

  }

}

