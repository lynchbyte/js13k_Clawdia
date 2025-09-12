import * as THREE from "three"

import { EventEmitter } from "./classEventEmitter.js";
export const eventInst = new EventEmitter();

import { Stage } from "./classStage.js";
export const stage = new Stage(eventInst);

import { SongPlayer } from './audio_song_player.js';
import { yourSongData } from './audio_song_data.js';

import { SfxPlayer } from './audio_sfx_player.js';
export const sfxPlayer = new SfxPlayer(stage.listener.context);

import { Portal } from "./classPortal.js";
export const portal = new Portal();
portal.initPortal();

import { Game } from "./classGame.js";
export const game = new Game(eventInst);
game.setMode(game.modes.PREGAME);

import { Huds } from './classHUDS.js';
export const huds = new Huds();

import { Gems } from "./classGems.js";
export const gems = new Gems();


import { Player } from "./classPlayer.js";
export const player = new Player(stage);

import { Pregame } from "./classPreGame.js";
export const pregame = new Pregame();


import { CollisionBVH } from "./classBVH.js";
import { addMaze } from "./addStageComponents.js";
const environmentColliders = addMaze();
export const environmentCollisionBVH = new CollisionBVH(environmentColliders);


stage.init();


let song;

function playMySong() {

    song = new THREE.Audio(stage.listener);
    const songOb = new THREE.Object3D;

    songOb.add(song);
    stage.scene.add(songOb);

    const songPlayer = new SongPlayer(stage.listener.context, yourSongData);
    songPlayer.initSong();

    if (songPlayer.currentSongNode && songPlayer.currentSongNode.buffer) {

        song.setBuffer(songPlayer.currentSongNode.buffer);

        song.play();

    }

}

export function stopMySong() {

    song.stop();

}

playMySong();




