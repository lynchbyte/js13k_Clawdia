import * as THREE from "three";

import { stage, player, huds, sfxPlayer } from './script.js';
import { createText } from "./addHelpers.js";


let spriteMat;
let spriteMatDead;


export class Zombie {

    constructor() {

        this.zombieMesh = null;
        this.trackPlayer = this.trackPlayer.bind(this);
        this.zombieMap = new Map();
        this.zombRep = null;

    }

    createZombie() {

        this.zombieMesh = new THREE.Sprite(spriteMat);
        this.zombieMesh.scale.set(2, 2, 1); 
        this.zombieMesh.name = 'zombie';

        stage.scene.add(this.zombieMesh);

        //Create zombie replica
        const geometry = new THREE.SphereGeometry(0.01, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 'maroon' });
        this.zombRep = new THREE.Mesh(geometry, material);
        this.zombRep.name = "zombReplica"
        huds.zombReplicArr.push(this.zombRep);
        huds.paper.add(this.zombRep);

        this.zombieMap.set(this.zombieMesh, this.zombRep);

    }


    trackPlayer(alpha, cz) { //time, current zombie

        const speed = 9;
        const direction = new THREE.Vector3();
        direction.subVectors(player.dolly.position, cz.zombieMesh.position);
        direction.normalize();
        direction.multiplyScalar(speed * alpha);

        this.zombieMesh.position.add(direction);

        //warning sound in render loop  

    }
}


export function createZombieSpriteMaterial() {

    const zombie = createText('🐶', stage.world.font);
    const zmap = zombie.material.map.clone();

    spriteMat = new THREE.SpriteMaterial({ map: zmap, color: 0xffffff ,
    depthTest:false,
    });

}

export function createZombieSpriteMaterial_Dead() {

    const deadZombie = createText('💀', stage.world.font)
    const dmap = deadZombie.material.map.clone()

    spriteMatDead = new THREE.SpriteMaterial({ map: dmap, color: 0xffffff });

}


export function deadZombie(zomb, i) {

    clearInterval(sfxPlayer.zombieSoundIntervalId);

    sfxPlayer.playDeadZombie()

    zomb.zombieMesh.material = spriteMatDead; 
    zomb.zombieMesh.material.map.needsUpdate = true; 
    zomb.zombieMesh.scale.set(1, 1, 1);

    // stage.zombieArr.splice(i, 1); this happens in the render loop
    stage.zombieDeadArr.push(zomb);
    zomb.zombieMesh.name = "zombieDead";

    const pairedReplica = zomb.zombieMap

    if (pairedReplica) {

        let ob = pairedReplica.get(zomb.zombieMesh);
        ob.material.color.setHex(0x000000);
       
    } 

}

