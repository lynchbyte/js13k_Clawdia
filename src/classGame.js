import { pregame, stage, player, gems, huds, sfxPlayer, portal } from './script.js';

import { removeComponents } from './addHelpers.js';

export class Game {

    constructor(emitter) {

        this.emitter = emitter;

        this.mode = 'pregame';
        this.modes = {

            PREGAME: 'pregame',
            VR_MODE: 'vr_mode',
            DT_MODE: 'desktop_mode',

        };

        this.level = 1; //starting level
        this.score = 0; //starting score
        this.levelUpScore = 3;  //number of gems needed for next level

        this.screenFade = false;

        this.childrenToRemove = [];

        this.emitter.on('fadeComplete', () => {
            // console.log('Game received fadeComplete event. Proceeding...',
            //     huds
           // );

        });

        this.isGameSuspended = false;

    }

    setMode(newMode) {

        if (Object.values(this.modes).includes(newMode)) {

            this.mode = newMode;
            this.handleModeChange(newMode);

        } 
    }

    resetScore() {

        this.score = 0;
        huds.updateScoreDisplay();

    }

    handleModeChange(mode) {

        switch (mode) {

            case this.modes.VR_MODE:

                pregame.removePreGameElements();
                sfxPlayer.playMeow();

                huds.capture();

                break;


            case this.modes.DT_MODE:

                pregame.removePreGameElements();
                sfxPlayer.playMeow();

                player.speedFactor = 25;
                player.angularSpeed = 1.5;

                huds.capture();

                player.addEventListenersDT();

                player.addSword();

                break;

        }
    }

    cleanLevel() {

        player.dolly.position.set(0, 0, 135);
        player.dolly.rotation.set(0, 0, 0);

        clearInterval(sfxPlayer.zombieSoundIntervalId);

        removeComponents(huds.paper, "zombReplica", huds.zombReplicArr);
        removeComponents(stage.scene, "zombie", stage.zombieArr);
        removeComponents(stage.scene, "zombieDead", stage.zombieDeadArr);


        for (const [mesh, box] of gems.gemMeshToBoxMap.entries()) {

            stage.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();

        }
        gems.gemMeshToBoxMap.clear(); 

        this.prepLevel();

    }

    prepLevel() {

        huds.updateLevelDisplay();
        huds.updateScoreDisplay();

        gems.addGems(this.levelUpScore);

        portal.initPortal();

        huds.updateCapture();

    }
}
