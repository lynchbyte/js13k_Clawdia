

import * as THREE from 'three';
import { stage, game, stopMySong } from './script.js';
import { VRController } from './classVRControllers.js';


const createEl = (tag, parent, props = {}) => parent.appendChild(Object.assign(document.createElement(tag), props));

export class Pregame {
    constructor() {
        this.createUI();
        this.vrQuery();
    }

    createUI() {

        //Main title and containers
        const pregameElements = [
            createEl('div', document.body, { id: 'title', className: 'text', textContent: 'Clawdia' }),
            createEl('div', document.body, { className: 'box' }),
            createEl('div', document.body, { className: 'util' })
        ];
        pregameElements.forEach(el => el.classList.add('pregame-ui')); // Add common class for easy removal

        //Create popups from config
        this.createPopup('introID', 'Instructions', [
            'Eat all Mice', 'Slay dog', 'Snooze in dogs bed', 'For VR - thumb stick to move & squeeze for weapon', 'For Desktop - WASD to move & space bar for weapon'
        ]);
        this.createPopup('aboutID', 'About', [
            'Clawdia by Shauna Lynch for js13k comp. <a href="https://www.lynchbyte.com/index.html" target="_blank">lynchbyte</a>.',
            'License here; <a href="https://www.lynchbyte.com/20_Clawdia/license_Clawdia.html" target="_blank">MIT & CC BY-SA 4.0</a>',
            'Made with: <a href="https://threejs.org/" target="_blank">Three.js</a>',
            'and Sound Box <a href="https://sb.bitsnbites.eu/" target="_blank">Bits n Bites</a>.',
        ]);

        //Create buttons from config
        const [boxDiv, utilDiv] = [pregameElements[1], pregameElements[2]];
        [
            { parent: boxDiv, id: 'introB', left: '25%', text: 'Intro', event: () => this.togglePopup('introID', true) },
            { parent: boxDiv, id: 'startVR', left: '35%', fontSize: '40px', text: 'VR ?' },
            { parent: boxDiv, id: 'startDT', left: '65%', fontSize: '40px', text: 'Desktop', event: () => game.setMode(game.modes.DT_MODE) },
            { parent: boxDiv, id: 'aboutB', left: '75%', text: 'About', event: () => this.togglePopup('aboutID', true) },
            { parent: utilDiv, id: 'muteB', left: '50%', fontSize: '15px', text: '🔉', event: this.toggleMute },
            { parent: utilDiv, id: 'exitB', left: '50%', fontSize: '15px', text: 'Exit', event: () => window.location.reload() },
        ].forEach(cfg => {
            const btn = createEl('button', cfg.parent, { className: 'button', id: cfg.id, textContent: cfg.text });
            Object.assign(btn.style, { left: cfg.left, fontSize: cfg.fontSize || '' });
            if (cfg.event) btn.addEventListener('click', cfg.event);
        });
    }

    createPopup(id, title, content) {
        const popup = createEl('div', document.body, { id, className: 'popUpClass pregame-ui' });
        createEl('h1', popup, { textContent: title });
        content.forEach(line => createEl('p', popup, { innerHTML: line }));
        createEl('button', popup, { className: 'buttonClose', textContent: '❌', onclick: () => this.togglePopup(id, false) });
    }

    togglePopup = (id, show) => document.getElementById(id).style.visibility = show ? 'visible' : 'hidden';

    toggleMute = () => {
        const audioCtx = stage.listener.context;
        const muteB = document.getElementById('muteB');
        const isMuted = audioCtx.state === 'suspended';
        (isMuted ? audioCtx.resume() : audioCtx.suspend()).then(() => {
            muteB.textContent = isMuted ? '🔉' : '🔇';
        });
    }


  removePreGameElements() {

    stopMySong();

    const elementsToRemove = document.querySelectorAll('.pregame-ui');
    
    // excluding the 'util' div and its children
    elementsToRemove.forEach(el => {

        if (!el.classList.contains('util') && !el.closest('.util')) {
            el.remove();

        }

    });

}

    vrQuery() {

        let vrButton = document.getElementById('startVR');

        if (navigator.xr) {

            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {

                if (supported) {

                    vrButton.textContent = 'VR ✔️';

                    vrButton.addEventListener('click', () => {


                        navigator.xr.requestSession('immersive-vr', {
                            // optionalFeatures: ['hand-tracking']
                        })

                            .then(session => {

                                game.setMode(game.modes.VR_MODE);
                                onSessionStarted(session);
                                this.session = session;

                            })

                            .catch(err => {
                                console.log('Error starting session', err);
                            });

                    });


                } else {

                    vrButton.textContent = 'VR ❌';

                }

            }).catch((error) => {

                // console.error("Error checking VR support: ", error);
                vrButton.textContent = 'Error';

            });


        } else {

            vrButton.textContent = 'XR ❌';

        }

    }

}

async function onSessionStarted(session) {

    stage.renderer.xr.setReferenceSpaceType('local');
    await stage.renderer.xr.setSession(session);

    if (isMetaBrowser()) {

        showOculusHint(stage.scene);
    }

    const vrController1 = new VRController(stage.renderer, 0);
    const vrController2 = new VRController(stage.renderer, 1);

}


//no controller in quest
function showOculusHint() {

    const c = Object.assign(document.createElement('canvas'), { width: 1024, height: 128 });
    const ctx = c.getContext('2d');
    ctx.fillStyle = stage.colObj.c3;
    ctx.font = 'bold 20px Times New Roman';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No Controllers? Press re-centre button once, then resume', c.width / 2, c.height / 2);

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.45),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true })
    );
    mesh.position.set(0, -0.1, -2);
    stage.camera.add(mesh);

    setTimeout(() => {
        stage.camera.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.map.dispose();
        mesh.material.dispose();
    }, 5000);

}

function isMetaBrowser() {

    const ua = navigator.userAgent || "";
    return ua.includes("OculusBrowser") || ua.includes("Quest");

}

