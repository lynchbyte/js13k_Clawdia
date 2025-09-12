import { player, stage } from "./script.js";
import * as THREE from "three";

const raycasterXR = new THREE.Raycaster();
const intersectedXR = [];
export const vrCtrArr = [];

export class VRController {

    constructor(renderer, index) {

        this.controller = renderer.xr.getController(index);
        this.index = index;

        this.controller.addEventListener('connected', this.onControllerConnected.bind(this));
        this.controller.addEventListener('disconnected', this.onControllerDisconnected.bind(this));

        this.controller.addEventListener('squeezestart', (event) => this.onSqueezeStart(event));
        this.controller.addEventListener('squeezeend', (event) => this.onSqueezeEnd(event));

        this.controller.addEventListener('selectstart', (event) => this.onSelectStart(event));
        this.controller.addEventListener('selectend', (event) => this.onSelectEnd(event));

        this.currentHovered = null

        this.controller.userData.selected = undefined;

        this.hapticActuators = [];

        this.sword = null;
        this.line = null;

        vrCtrArr.push(this);

        player.dolly.add(this.controller);
       
    }

    onControllerConnected() {

        const clonedSword = stage.sword.clone();
        clonedSword.rotateY((THREE.MathUtils.degToRad(180)));

        this.controller.add(clonedSword);
        this.sword = clonedSword;

        this.sword.visible = false;

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: stage.colObj.c1, linewidth: 2 });
        this.line = new THREE.Line(lineGeometry, lineMaterial);
        this.line.name = 'line';
        this.line.scale.z = 5;
        this.controller.add(this.line);

        this.controller.name = (this.index === 0) ? 'controllerIndex0' : 'controllerIndex1';

    }

    onControllerDisconnected(e) {

        const controllerToRemove = e.target;
        const controllerIndex = vrCtrArr.indexOf(this);

        if (controllerIndex > -1) {

            vrCtrArr.splice(controllerIndex, 1);

        }

        if (controllerToRemove) {

            if (this.sword) controllerToRemove.remove(this.sword);
            if (this.line) controllerToRemove.remove(this.line);

        }

        this.sword = null;
        this.line = null;
        this.hapticActuators = [];

    }

    onSqueezeStart(event) {

        event.data.gamepad.hapticActuators[0].pulse(0.2, 100);

        this.sword.visible = true;
        this.line.visible = false;
        player.usingSword = true;

    }


    onSqueezeEnd(event) {

        const gamepad = event.data && event.data.gamepad;


        if (this.sword && gamepad && gamepad.buttons && gamepad.buttons.length > 1 && !gamepad.buttons[1].pressed) {

            this.sword.visible = false;
            this.line.visible = true;

            player.usingSword = false;

        }
    }


    onSelectStart(event) {

        this.handleSelect(event, true);

    }


    onSelectEnd(event) {

        this.handleSelect(event, false);

    }


    handleSelect(event, isStart = true) {

        const controller = event.target;

        if (isStart) {

            const intersections = this.getIntersections(controller);

            if (intersections.length > 0) {

                const intersection = intersections[0];
                const object = intersection.object;

                controller.userData.selected = object;

                clickedOn(object);
            }
        }

        else {

            if (controller.userData.selected) {

                controller.userData.selected = undefined;

            }
        }
    }


    handleHover(controller = this.controller, isHovering = true) {

        if (controller.userData.selected) return;

        const line = controller.getObjectByName('line');
        if (!line) return;

        const intersections = this.getIntersections(controller);
        const intersectedObject = intersections.length > 0 ? intersections[0].object : null;

        if (intersectedObject && isHovering) {

            line.scale.z = intersections[0].distance;

            if (intersectedObject !== this.currentHovered) {

                if (this.currentHovered) {

                    this.resetHover(this.currentHovered);

                }

                intersectedObject.material.emissive.r = 1;

                if (!intersectedXR.includes(intersectedObject)) {

                    intersectedXR.push(intersectedObject);

                }

                this.currentHovered = intersectedObject;
            }
        }

        else {

            line.scale.z = 5;

            if (!isHovering && this.currentHovered) {

                this.resetHover(this.currentHovered);
                this.currentHovered = null;
                this.unhoverObjects(controller);

            }

            else if (this.currentHovered && intersectedObject !== this.currentHovered) {

                this.resetHover(this.currentHovered);
                this.currentHovered = null;

            }

        }

    }

    resetHover(object) {

        object.material.emissive.r = 0;
        const index = intersectedXR.indexOf(object);

        if (index > -1) {

            intersectedXR.splice(index, 1);

        }
    }

    unhoverObjects() {

        while (intersectedXR.length) {

            const object = intersectedXR.pop();

            if (object !== this.currentHovered) {

                object.material.emissive.r = 0;

            }

        }

    }

    getIntersections(controller) {

        controller.updateMatrixWorld();
        raycasterXR.setFromXRController(controller);
        return raycasterXR.intersectObjects(stage.clickable_3D);

    }

}


export function updateControllerHover(controllerInstance) {

    controllerInstance.handleHover();

}

export function clickedOn(object) {

    switch (object.name) {

        case 'Exit VR':

            window.location.reload();
    
            break;


        default:
            console.log(`Clicked On default .....`);
            break;

    }

}

