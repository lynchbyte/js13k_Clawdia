import * as THREE from "three";

import { stage, player, gems, game, sfxPlayer } from "./script.js";


export class Portal{

  constructor(){

    this.door={w:12,h:5,d:12};
    this.geo=new THREE.BoxGeometry(this.door.w,this.door.h,this.door.d);
    this.mat=new THREE.MeshStandardMaterial({color:0x0f0,wireframe:!0});
    this.cube=this.box=null;
    this.map=new Map;
    this.pos=new THREE.Vector3(0,this.door.h/2-1.3,0);

  }

  initPortal(){

    this.cube=new THREE.Mesh(this.geo,this.mat);
    this.cube.position.copy(this.pos);
    this.cube.visible=!1;
    stage.scene.add(this.cube);
    this.box=new THREE.Box3().setFromObject(this.cube);
    this.map.set(this.cube,this.box);

  }

  async checkPortalCollision(){

    if(!this.box)return;

    if(this.box.containsPoint(player.dolly.position)
      &&!gems.gemMeshToBoxMap.size&&!stage.zombieArr.length
      &&!game.isGameSuspended){

        game.isGameSuspended=game.screenFade=!0;
        clearInterval(sfxPlayer.zombieSoundIntervalId);
        sfxPlayer.playLevelUp();
        stage.scene.remove(this.cube);
        this.box=null;

        try{

          await game.emitter.waitOnce("fadeComplete",5e3);
          game.score=0;
          game.level++;
          game.levelUpScore++;
          game.cleanLevel();

        }catch(e){

          game.screenFade=!1;
          game.cleanLevel();

        }

        game.isGameSuspended=!1;
    }

  }


}

