import * as THREE from "three";

import { stage, game, sfxPlayer } from './script.js';
import { addArrow } from './addHelpers.js';

export class Player {

  constructor() {

    this.dolly = new THREE.Group();
    this.keys = { w: false, a: false, s: false, d: false };

    this.speedFactor = 25;
    this.angularSpeed = 1;

    this.distanceFromHome;

    this.usingSword = false;

    this.colliderHeight = 1.8;
    this.colliderWidth = 0.8;
    this.colliderDepth = 0.8;

    this.playerCollider = new THREE.Box3();
    this.playerColliderMesh = new THREE.Mesh(

      new THREE.BoxGeometry(this.colliderWidth, this.colliderHeight, this.colliderDepth),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.5 })

    );

    this.playerColliderMesh.visible = false;
    this.dolly.add(this.playerColliderMesh);

    this.homePosition = new THREE.Vector3(0, 0, -135);

    this.sword2 = null; // For desktop sword clone

  }

  addDolly() {

    stage.scene.remove(stage.camera);
    this.dolly.add(stage.camera);
    this.dolly.position.set(0, 0, 135);
    this.dolly.name = 'Dolly';
    stage.scene.add(this.dolly);

    const arrowGeo = addArrow();
    const arrowMatl = new THREE.MeshStandardMaterial({ color: 'black' });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMatl);

    arrowMesh.rotateX(-Math.PI / 2);
    arrowMesh.scale.set(0.03, 0.03, 0.03);
    arrowMesh.position.set(0, -0.5, -1);
    arrowMesh.name = 'arrow';
    this.dolly.add(arrowMesh);

  }

  addSword() {//desktop only

    this.dolly.add(stage.sword);

    stage.sword.rotateX((THREE.MathUtils.degToRad(30)));
    stage.sword.rotateY((THREE.MathUtils.degToRad(180)));

    stage.sword.translateX(0.25);

    //move in world Y
    stage.sword.translateZ(0.65);

    //move in world Z
    stage.sword.translateY(0.5);

    this.sword2 = stage.sword.clone(true);
    this.dolly.add(this.sword2);

    this.sword2.translateX(-0.5);
    this.sword2.visible = false;

    stage.sword.visible = false;

  }


  async deadPlayer() {

    if (game.isGameSuspended) return;

    game.isGameSuspended = true;

    game.screenFade = true;

    clearInterval(sfxPlayer.zombieSoundIntervalId);

    sfxPlayer.playPlayerDead();

    try {

      await game.emitter.waitOnce('fadeComplete', 5000);

      game.score = 0;

      game.cleanLevel();

    } catch (error) {

      game.screenFade = false;
      game.cleanLevel();

    }

    game.isGameSuspended = false;

  }


  handleTrumanZone() {

    this.dolly.position.multiplyScalar(0.9);

  }


  addEventListenersDT() {

    document.addEventListener('keydown', this.onDocumentKeyDown.bind(this));

    document.addEventListener('keyup', this.onDocumentKeyUp.bind(this));

  }

  onDocumentKeyDown(event) {

    event.preventDefault();

    const keyCode = event.which;

    switch (keyCode) {
      case 87: // w
      case 38: // Arrow Up
        this.keys.w = true;
        break;

      case 83: // s
      case 40: // Arrow Down
        this.keys.s = true;
        break;

      case 65: // a
      case 37: // Arrow Left
        this.keys.a = true;
        break;

      case 68: // d
      case 39: // Arrow Right
        this.keys.d = true;
        break;

      case 81: // q
        this.keys.q = true;
        break;

      case 32: // space
        if (this.usingSword === false) {

          sfxPlayer.playSwordOut();

        }
        stage.sword.visible = true;
        this.sword2.visible = true;
        this.usingSword = true
        break;

      default:
        break;
    }
  }

  onDocumentKeyUp(event) {

    event.preventDefault();

    const keyCode = event.which;

    switch (keyCode) {

      case 87: // w
      case 38: // Arrow Up
        this.keys.w = false;
        break;

      case 83: // s
      case 40: // Arrow Down
        this.keys.s = false;
        break;

      case 65: // a
      case 37: // Arrow Left
        this.keys.a = false;
        break;

      case 68: // d
      case 39: // Arrow Right
        this.keys.d = false;
        break;

      case 32: // space
        sfxPlayer.playSwordIn()
        stage.sword.visible = false;
        this.sword2.visible = false;
        this.usingSword = false;
        break;

      default:
        break;

    }

  }

  updateMovement(keys, environmentCollisionBVH, deltaTime, session = null) {

    const moveSpeed = this.speedFactor * deltaTime;
    const rotateSpeed = this.angularSpeed * deltaTime;

    const oldPosition = this.dolly.position.clone();
    let rotating = false;

    // Handle VR Gamepad input
    if (session && session.inputSources.length > 0) {

      let gp = session.inputSources[0].gamepad;

      if (!gp) return; // No gamepad

      // Fallback to the second controller 
      if (gp.axes.every(axis => axis === 0) && session.inputSources.length > 1) {

        gp = session.inputSources[1].gamepad;

      }

      const forwardVector = new THREE.Vector3(0, 0, -1);
      forwardVector.applyQuaternion(this.dolly.quaternion);

      // Forward/Backward movement
      if (gp.axes[3] > 0.1 || gp.axes[3] < -0.1) {

        this.dolly.position.addScaledVector(forwardVector, -gp.axes[3] * moveSpeed);

      }

      // Left/Right rotation
      if (gp.axes[2] > 0.5 || gp.axes[2] < -0.5) {

        this.dolly.rotation.y -= gp.axes[2] * rotateSpeed;
        rotating = true;

      }

    }


    // Handle Desktop (WASD) input
    if (keys.a) {

      this.dolly.rotation.y += rotateSpeed;

    }

    if (keys.d) {

      this.dolly.rotation.y -= rotateSpeed;

    }

    if (keys.q) {

      this.dolly.position.addScaledVector(new THREE.Vector3(0, 1, 0), moveSpeed);

    }

    const forwardVector = new THREE.Vector3(0, 0, -1);
    forwardVector.applyQuaternion(this.dolly.quaternion);

    if (keys.w) {

      this.dolly.position.addScaledVector(forwardVector, moveSpeed);

    }


    if (keys.s) {

      this.dolly.position.addScaledVector(forwardVector, -moveSpeed);

    }

    //for footstep sound
    const movedDistance = oldPosition.distanceTo(this.dolly.position);
    const movementDetected = movedDistance > 0.05;;

    if (movementDetected) {

      const now = sfxPlayer.audioContext.currentTime;

      if (now - sfxPlayer.lastFootstepTime > sfxPlayer.footstepCooldown) {

        sfxPlayer.playFootSteps();
        sfxPlayer.lastFootstepTime = now;

      }

      //TODO fix for Wolvic???
      // console.log("movedDistance:", movedDistance,
      //   "movementDetected:", movementDetected,
      //   "now:", now,
      //   "lastFootstepTime:", sfxPlayer.lastFootstepTime);

    }

    this.playerCollider.setFromCenterAndSize(

      new THREE.Vector3(
        this.dolly.position.x,
        (this.dolly.position.y + this.colliderHeight / 2),
        this.dolly.position.z),
      new THREE.Vector3(this.colliderWidth, this.colliderHeight, this.colliderDepth)

    );

    this.playerColliderMesh.position.set(0, (this.colliderHeight / 2) + stage.world.moveDown, 0);

    const potentialColliders = environmentCollisionBVH.query(this.playerCollider);

    for (const envCollider of potentialColliders) {

      if (this.playerCollider.intersectsBox(envCollider)) {

        const penetrationVector = new THREE.Vector3();
        this._getPenetrationVector(this.playerCollider, envCollider, penetrationVector);

        if (Math.abs(penetrationVector.x) < 0.05 && Math.abs(penetrationVector.z) < 0.05 && penetrationVector.y > 0 && penetrationVector.y <= this.stepHeight) {

          this.dolly.position.y += penetrationVector.y;
          this.playerCollider.translate(new THREE.Vector3(0, penetrationVector.y, 0));

        } else {

          this.dolly.position.add(penetrationVector);
          this.playerCollider.translate(penetrationVector);

        }

      }

    }

    if (this.dolly.position.y < this.colliderHeight / 2) {

      this.dolly.position.y = this.colliderHeight / 2;
      this.playerCollider.setFromCenterAndSize(
        new THREE.Vector3(this.dolly.position.x, this.dolly.position.y + this.colliderHeight / 2, this.dolly.position.z),
        new THREE.Vector3(this.colliderWidth, this.colliderHeight, this.colliderDepth)
      );

    }

    // Truman Zone check
    this.distanceFromHome = this.dolly.position.distanceTo(new THREE.Vector3());
    if (this.distanceFromHome > stage.world.width / 2 - 0.75) {

      this.handleTrumanZone();

    }

  }


  _getPenetrationVector(box1, box2, target) {
    
    const center1 = new THREE.Vector3(); box1.getCenter(center1);
    const center2 = new THREE.Vector3(); box2.getCenter(center2);
    const size1 = new THREE.Vector3(); box1.getSize(size1);
    const size2 = new THREE.Vector3(); box2.getSize(size2);

    const overlapX = (size1.x / 2 + size2.x / 2) - Math.abs(center1.x - center2.x);
    const overlapY = (size1.y / 2 + size2.y / 2) - Math.abs(center1.y - center2.y);
    const overlapZ = (size1.z / 2 + size2.z / 2) - Math.abs(center1.z - center2.z);

    if (overlapX < 0 || overlapY < 0 || overlapZ < 0) {
      target.set(0, 0, 0); // No overlap
      return;
    }

    if (overlapX < overlapY && overlapX < overlapZ) {
      target.set(overlapX * Math.sign(center1.x - center2.x), 0, 0);
    } else if (overlapY < overlapX && overlapY < overlapZ) {
      target.set(0, overlapY * Math.sign(center1.y - center2.y), 0);
    } else {
      target.set(0, 0, overlapZ * Math.sign(center1.z - center2.z));
    }
  }

}




