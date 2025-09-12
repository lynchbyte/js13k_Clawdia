import * as THREE from 'three';
import { stage, player, game } from './script.js';
import { createText, updateText } from './addHelpers.js';

export class Huds {

    constructor() {

        this.paper = null;
        this.paperPosition = new THREE.Vector3(-1, 0.5, -2);
        this.paperWidth = 0.8;

        this.captured = false;

        this.cameraScis = null;
        this.renderer2 = null;

        this.canvas = null;

        this.me = null;
        this.localSpaceVector = new THREE.Vector3();
        this.localSpaceEuler = new THREE.Euler();

        this.zomb = null;
        this.zombReplicArr = [];

        this.levelDisplay = null;
        this.scoreDisplay = null;

    }

    capture() {

        const cav = this.initializeRenderer();
        cav.style.display = 'none';

        const base64 = cav.toDataURL('img/png');
        const img = new Image();
        img.src = base64;

        img.onload = () => {

            if (this.canvas == null) {

            this.createPaperMesh(img);
            
            }

            if (this.captured == false) {

                this.createMeReplica();
                this.createExitButton();
                this.createLevelDisplay();
                this.createScoreDisplay();
                this.captured = true;
            }

        };

        img.onerror = (error) => {

            console.error('HUDS, Failed to load image:', error);

        };
    }

    updateCapture() {

        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderer2.render(stage.scene, this.cameraScis);
        const cav2 = this.renderer2.domElement;
        const base64 = cav2.toDataURL('img/png');
        const img2 = new Image();
        img2.src = base64;

        img2.onload = () => {

            context.drawImage(img2, 0, 0, this.canvas.width, this.canvas.height);
            const paperTexture2 = new THREE.Texture(this.canvas);
            this.paper.material.map = paperTexture2;
            this.paper.material.map.needsUpdate = true;

        }
    }

    initializeRenderer() {

        if (this.captured == false) {

            this.renderer2 = new THREE.WebGLRenderer({ antialias: true });
            document.body.appendChild(this.renderer2.domElement);

            this.cameraScis = new THREE.OrthographicCamera(
                stage.world.width / -2,
                stage.world.width / 2,
                stage.world.width / 2,
                stage.world.width / -2,
                0.1,
                1000
            );

            this.cameraScis.position.set(0, 4, 0);
            this.cameraScis.lookAt(new THREE.Vector3(0, 0, 0));
             this.cameraScis.layers.enable(3);
            stage.scene.add(this.cameraScis);

        }

        this.renderer2.render(stage.scene, this.cameraScis);
        return this.renderer2.domElement;

    }

    createPaperMesh(img) {

        this.canvas = document.createElement('canvas');
        const context = this.canvas.getContext('2d');
        context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        const paperTexture = new THREE.Texture(this.canvas);

        const paperMat = new THREE.MeshBasicMaterial({ map: paperTexture, side: 2 });

        const paperGeo = new THREE.CircleGeometry(this.paperWidth / 2, 32);

        this.paper = new THREE.Mesh(paperGeo, paperMat);
        this.paper.position.copy(this.paperPosition);
        player.dolly.add(this.paper);
        paperMat.map.needsUpdate = true;

    }

    createMeReplica() {

        const geometry = new THREE.SphereGeometry(0.02, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: stage.colObj.c1 });
        this.me = new THREE.Mesh(geometry, material);

        const geometry2 = new THREE.ConeGeometry(0.02, 0.05, 32);
        const cone = new THREE.Mesh(geometry2, material);
        cone.position.set(0, 0.03, 0)
        this.me.add(cone);
        this.me.scale.set(0.6,0.6,0.6);
        this.paper.add(this.me);

    }

    //for player, with rotation
    upDateReplica(ob, meshReplica) {  //TODO update player to paired replica and use below Map update

        if (this.paper == undefined) { return }

        this.localSpaceVector.copy(this.paperPosition).applyMatrix4(ob.matrixWorld);

        meshReplica.position.set(

            this.localSpaceVector.x, - this.localSpaceVector.z, 0

        )
            .multiplyScalar(this.paperWidth / stage.world.width)

        this.localSpaceEuler.setFromRotationMatrix(ob.matrixWorld, 'YXZ');
        meshReplica.rotation.set(0, 0, this.localSpaceEuler.y,);


    }

    //for zombies, no rotation
    upDateReplicaMap(ob) { 

        if (this.paper == undefined) { return }

        this.localSpaceVector.copy(this.paperPosition).applyMatrix4(ob.zombieMesh.matrixWorld);

        const meshReplica = ob.zombRep;

        if (meshReplica) {

            meshReplica.position.set(

                this.localSpaceVector.x, - this.localSpaceVector.z, 0

            )
                .multiplyScalar(this.paperWidth / stage.world.width)


        }

    }

    createExitButton() {

        if (game.mode == 'vr_mode') {

            const exit = createText('EXIT', stage.world.font);

            exit.position.set(0, -0.55, 0);
            exit.name = "Exit VR"

            this.paper.add(exit);
            stage.clickable_3D.push(exit)

        }

    }

    createLevelDisplay() {

        this.levelDisplay = createText('L1', stage.world.font);

        this.levelDisplay.position.set(-0.35, 0.35, 0);

        this.paper.add(this.levelDisplay);

    }

    createScoreDisplay() {

        this.scoreDisplay = createText('🐭 0', stage.world.font);

        this.scoreDisplay.position.set(0.35, 0.35, 0);

        this.paper.add(this.scoreDisplay);

    }

    updateLevelDisplay() {

        updateText(this.levelDisplay, `${'L'}${game.level}`);

    }

    updateScoreDisplay() {

        updateText(this.scoreDisplay, `${'🐭'}${game.score}`);

    }

}

