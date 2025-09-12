import * as THREE from "three";


import { game, huds, sfxPlayer, pregame, gems, player, environmentCollisionBVH, portal, stage } from "./script.js";
import { createZombieSpriteMaterial, createZombieSpriteMaterial_Dead, deadZombie } from "./classZombie.js";
import { vrCtrArr, updateControllerHover } from './classVRControllers.js';
import { addSkySphere, addWorldFloor, addClaw, addPillow } from "./addStageComponents.js";

//import { OrbitControls } from './OrbitControls.js';
//import GUI from 'lil-gui';//TODO remove before game time



export class Stage {

    constructor(emitter) {

        // this.gui = new GUI({ closeFolders: true });
        // this.gui.close();

        /////////////////////////////////////////////////////////////////////////////////////////////////////
        this.colObj = {
            c1: 0x6D6E80, // #6D6E80, buttons / mouse traps / pillow side edge gradient / cat huds replica / vr controller line ✅
            c2: 0xC8C8C8, // #C8C8C8, occulus text ✅
            c3: 0xe39c00, // #e39c00, world floor ✅
            c4: 0xa5250d, // #a5250d, maze walls ✅
            c5: 0xf1bec7, // #f1bec7, sky gradient bottom ✅
            c6: 0x000000, // #000000, black ✅
            c7: 0x5c3ec8, // #5c3ec8, pillow ✅
            c8: 0x301d75, // #301d75, pillow button ✅
            c9: 0x5f0a14, // #5f0a14, sky gradient top 
            c10: 0xdcb478, // #dcb478, maze floor for huds
            c11: 0x7e3e45, // #7e3e45, maze walls lighter
        };


        this.emitter = emitter;

        // World properties
        this.world = {

            width: 300,
            height: 150,
            moveDown: -1.5,
            font: 'Chiller'// 'serif'

        };

        // Scene groups
        this.worldGroup = new THREE.Group();

        // Window Size
        this.sizesWindowInner = {

            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)

        };

        //Fade out plane
        this.blackOutPlane = null;
        this.opacityDirection = 1;
        this.fadeDuration = 2;

        //Audio
        this.listener = new THREE.AudioListener();
        this.zdistArr = [];
        this.willPlay = false;

        //BVH
        this.environmentCollisionBVH;

        // Scene setup
        this.scene = new THREE.Scene();


        //CAMERA LAYERS
        //0 = default scene, desktop and rendered in both eyes
        //1 = three.js reserved vr left eye
        //2 = three.js reserved vr right eye
        //3 = huds capture camera

        this.camera = new THREE.PerspectiveCamera(
            50,
            this.sizesWindowInner.width / this.sizesWindowInner.height,
            0.1,
            1000
        );
        this.camera.near = 0.01;

        this.scene.add(this.camera);
        this.camera.add(this.listener);

        this.clock = new THREE.Clock();
        this.elapsedTime = this.clock.getElapsedTime();

        const light = new THREE.HemisphereLight(0xfff0f0, 0x60606, 1.2);
        light.position.set(1, 1, 1);
        this.scene.add(light);

        const lightAmb = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(lightAmb);

        const lightConfigs = [
            { position: [0, 20, 0] },
            { position: [100, 20, 100] },
            { position: [-100, -20, -100] }
        ];

        lightConfigs.forEach(config => {

            const light = new THREE.DirectionalLight(0xffffff, 0.5);
            light.position.set(...config.position);
            this.scene.add(light);

        });

        // if (this.gui) {
        //     const folder = this.gui.addFolder('Lights ');
        //     folder.addColor(light, 'color').name('Hemisphere Color');
        //     folder.add(light, 'intensity', 0, 10).name('Hemisphere Intensity');
        //     folder.add(light, 'visible').name('Hemisphere Visible');

        //     folder.add(lightAmb, 'intensity', 0, 10).name('Ambient Intensity');
        //     folder.add(lightAmb, 'visible').name('Ambient Visible');
        //     folder.addColor(lightAmb, 'color').name('Ambient Color');


        //     lightConfigs.forEach((config, index) => {
        //         const dirLight = this.scene.children.find(light => light instanceof THREE.DirectionalLight && light.position.equals(new THREE.Vector3(...config.position)));
        //         if (dirLight) {
        //             const dirFolder = folder.addFolder(`Directional Light ${index + 1}`);
        //             dirFolder.addColor(dirLight, 'color').name('Color');
        //             dirFolder.add(dirLight, 'intensity', 0, 10).name('Intensity');
        //             dirFolder.add(dirLight, 'visible').name('Visible');
        //             dirFolder.add(dirLight.position, 'x', -50, 50).name('Position X');
        //             dirFolder.add(dirLight.position, 'y', -50, 50).name('Position Y');
        //             dirFolder.add(dirLight.position, 'z', -50, 50).name('Position Z');
        //         }
        //     });
        // }

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.sizesWindowInner.width, this.sizesWindowInner.height);
        this.renderer.setPixelRatio(this.sizesWindowInner.pixelRatio);
        this.renderer.xr.enabled = true;

        document.body.appendChild(this.renderer.domElement);

        // Orbit Controls 
        // this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.orbitControls.target.set(0, 0, -5);
        // this.orbitControls.update();

        this.clickable_3D = [];

        this.zombieArr = [];
        this.zombieDeadArr = [];

        this.sword = null;

    }


    init() {

        addSkySphere();
        addWorldFloor();
        addPillow();
        //  addMaze(); // see bvBVH at sript.js
        this.scene.add(this.worldGroup);

        this.sword = addClaw();

        gems.addGems(game.levelUpScore);

        player.addDolly();

        createZombieSpriteMaterial();
        createZombieSpriteMaterial_Dead()

        //fade plane
        this.blackOutPlane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4),
            new THREE.MeshBasicMaterial({
                color: 0x000022,
                transparent: true,
                opacity: 0.01
            })
        );
        this.blackOutPlane.position.set(0, 0, -1);
        this.camera.add(this.blackOutPlane);


        this.addResizeListener();

        this.animate();

    }


    addResizeListener() {

        window.addEventListener('resize', () => {

            this.sizesWindowInner.width = window.innerWidth
            this.sizesWindowInner.height = window.innerHeight
            this.sizesWindowInner.pixelRatio = Math.min(window.devicePixelRatio, 2)

            this.camera.aspect = this.sizesWindowInner.width / this.sizesWindowInner.height
            this.camera.updateProjectionMatrix()

            this.renderer.setSize(this.sizesWindowInner.width, this.sizesWindowInner.height)
            this.renderer.setPixelRatio(this.sizesWindowInner.pixelRatio)

        })

    }


    animate() {

        this.renderer.setAnimationLoop(() => this.render());

    }

    render() {

        const delta = this.clock.getDelta();

        //Gems rotate
        if (gems.gemMeshToBoxMap.size > 0) {

            gems.gemMeshToBoxMap.forEach((box, mesh) => {

                mesh.rotation.y += 0.005;

            });
        }


        if (player && game.mode == 'desktop_mode') {

            player.updateMovement(player.keys, environmentCollisionBVH, delta, null);

        }


        //Screen Fade
        if (game.screenFade == true) {

            this.blackOutPlane.material.opacity += (1 / this.fadeDuration) * delta * this.opacityDirection; //fade out 2 seconds

            if (this.blackOutPlane.material.opacity >= 1) {

                this.opacityDirection = -1;

            }

            if (this.blackOutPlane.material.opacity <= 0) {

                this.blackOutPlane.material.opacity = 0.01
                this.opacityDirection = 1;

                this.emitter.emit('fadeComplete');

                game.screenFade = false;

            }

        }

        //check for portal collision
        if (portal) {

            portal.checkPortalCollision();

        }

        //Gem collection
        if (gems.gemMeshToBoxMap.size > 0) {

            const boxesToCheck = Array.from(gems.gemMeshToBoxMap.values());

            for (const box of boxesToCheck) {

                if (box.userData && box.containsPoint(player.dolly.position) && box.userData.beenSelected === false) {

                    box.userData.beenSelected = true;
                    gems.collectGem(box);

                }
            }
        }

        //Zombie track player and check for dead time
        if (this.zombieArr.length > 0) {

            for (let i = 0; i < this.zombieArr.length; i++) {

                const currentZombie = this.zombieArr[i];
                currentZombie.trackPlayer(delta, currentZombie);

                //deadtime
                if (currentZombie) {

                    const distance = player.dolly.position.distanceTo(currentZombie.zombieMesh.position);
                    this.zdistArr.push(distance);

                    if (player.usingSword == true && distance < 1) { //within 1m of player

                        deadZombie(currentZombie, i);
                        this.zombieArr.splice(i, 1);

                    }

                    else if (player.usingSword == false && distance < 0.5) {

                        player.deadPlayer();

                    }

                }

            }

            //zombie audio warning
            this.toPlay = this.zdistArr.some((distance) => distance > 0.5 && distance <= 25);
            sfxPlayer.manageZombieSound(this.toPlay);
            this.zdistArr.length = 0;

        }

        //huds update
        huds.upDateReplica(player.dolly, huds.me);
        for (let i = 0; i < this.zombieArr.length; i++) {

            const currentZombie = this.zombieArr[i];
            huds.upDateReplicaMap(currentZombie);

        }

        //VR controllers
        if (this.renderer.xr.isPresenting && vrCtrArr.length > 0) {

            vrCtrArr.forEach(controllerInstance => {

                updateControllerHover(controllerInstance);

            });

            player.updateMovement(player.keys, environmentCollisionBVH, delta, pregame.session);

        }


        this.renderer.render(this.scene, this.camera);


    }

}









