import * as THREE from "three";

import { game, huds, sfxPlayer, stage } from "./script.js";
import { Zombie } from "./classZombie.js";
import { createText } from "./addHelpers.js";

export class Gems {

    constructor() {

        this.gemGeo = new THREE.IcosahedronGeometry(2, 1);

        this.gemMeshToBoxMap = new Map(); // Key: THREE.Mesh, Value: THREE.Box3

        this.gemMat = new THREE.MeshStandardMaterial({

            color: stage.colObj.c1,
            wireframe: true

        });

    }

    addGems(count) {

        let gemMesh;
        let xz = new THREE.Vector2();

        const mouse = createText('🐀', stage.world.font)//🐁🐭
        const mouseMap = mouse.material.map.clone()
        const spriteMat = new THREE.SpriteMaterial({ map: mouseMap, color: 0xffffff });

        for (let i = 0; i < count; i++) {

            gemMesh = new THREE.Mesh(this.gemGeo, this.gemMat);

            const angleStep = (2 * Math.PI) / count;
            const angle = i * angleStep;
            const radiusArr = [62, 96, 135];  //radii where gems can spawn
            const radius = radiusArr[Math.floor(Math.random() * radiusArr.length)];  //pick radom radius from array

            xz.x = radius * Math.cos(angle);
            xz.z = radius * Math.sin(angle);

            gemMesh.position.set(xz.x, 1, xz.z);
            gemMesh.userData = { index: i }

            gemMesh.add(new THREE.Sprite(spriteMat));

            stage.scene.add(gemMesh);

            const boxGem = new THREE.Box3().setFromObject(gemMesh);
            boxGem.userData = { beenSelected: false };
            this.gemMeshToBoxMap.set(gemMesh, boxGem);

        }


    }

    async collectGem(collectedBox) {  //collect last Gem, go to portal to level up

        sfxPlayer.playGemCollect();
        game.score = game.score + 1;
        huds.updateScoreDisplay();

        let collectedGemMesh = null;

        for (const [mesh, box] of this.gemMeshToBoxMap.entries()) {

            if (box === collectedBox) {
                collectedGemMesh = mesh;
                break;
            }

        }

        if (collectedGemMesh) {

            collectedGemMesh.children.forEach(child => {

                if (child instanceof THREE.Sprite) {

                    collectedGemMesh.remove(child);

                }

            });

            stage.scene.remove(collectedGemMesh);
            collectedGemMesh.geometry.dispose();
            if (collectedGemMesh.material) collectedGemMesh.material.dispose();

            this.gemMeshToBoxMap.delete(collectedGemMesh);

        } else {

            return;

        }

        huds.updateCapture();

        setTimeout(() => {

            const newZombie = new Zombie();
            newZombie.createZombie();
            stage.zombieArr.push(newZombie);
            sfxPlayer.playZombieRelease();

        }, 1000);

    }

}
