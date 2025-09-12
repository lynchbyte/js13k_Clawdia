export class SfxPlayer {

    constructor(audioContext) {

        this.audioContext = audioContext;
        this.zombieSoundIntervalId = null;

        this.lastFootstepTime = 0; 
        this.footstepCooldown = 0.25;
    }

    playSound(startFrqy, endFrqy, bend, duration, type = 'sine',
        osc2 = false, startFrqy2, endFrqy2, bend2, duration2, type2 = 'sine') {

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;

        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(startFrqy, now);

        oscillator.frequency.linearRampToValueAtTime(endFrqy, now + duration * bend);
        oscillator.frequency.exponentialRampToValueAtTime(startFrqy, now + duration);

        gainNode.gain.setValueAtTime(1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + duration);

        if (osc2) {
            const oscillator2 = this.audioContext.createOscillator();
            oscillator2.type = type2;
            oscillator2.frequency.setValueAtTime(startFrqy2, now + duration);
            oscillator2.frequency.linearRampToValueAtTime(endFrqy2, now + duration + duration2 * bend2); // Pitch bend up + or down -

            oscillator2.connect(gainNode);
            oscillator2.start(now + duration);
            oscillator2.stop(now + duration + duration2);

        }

    }

    playMeow() {

        { this.playSound(700, 1500, 0.1, 0.5, 'square', true, 1500, 500, 1, 0.7, 'sine'); }

    }


    playSwordOut() {

        { this.playSound(300, 400, 0.5, 0.5, 'sine', true, 1000, 1500, 0.5, 0.7, 'sine'); }

    }

    playSwordIn() {

        { this.playSound(300, 400, 0.1, 0.5, 'sine'); }

    }

    playGemCollect() {

        { this.playSound(800, 1500, 0.8, 0.6, 'sine', true, 1350, 1880, 0.01, 0.1); }

    }

    playLevelUp() {

        { this.playSound(1150, 1775, 0.7, 0.5, 'sine', true, 1650, 2000, 0.01, 0.3, 'triangle'); }

    }

    playZombieRelease() {

        { this.playSound(400, 50, 0.1, 1, 'sawtooth') }

    }


    playZombieNear() {

        //woof
        { this.playSound(135, 500, 0.43, 0.6, 'sine', true, 161, 500, 0.51, 0.4, 'sine'); }
      

        //annoying alarm
        // { this.playSound(1600, 80, 0.9, 1, 'square'); }
        // { this.playSound(550, 10, -0.1, 0.2, 'square') }

    }

    playDeadZombie() {

        { this.playSound(400, 80, 0.4, 1, 'sawtooth', true, 380, 70, 0.2, 0.7, 'square') }
    }

    playPlayerDead() {

        { this.playSound(400, 80, 0.1, 1, 'sawtooth', true, 180, 70, -0.1, 1, 'triangle'); }

    }

    playFootSteps() {

        //cat steps????
        { this.playSound(120, 110, 1, 0.01, 'sine'); }

        //footstep
        // this.playSound(440, 200, 0.1, 0.01, 'triangle');
    }

    // playPurr(){

    //     { this. playSound(169, 163, 1, 5, 'sine', true, 114, 95, 0.5, 5, 'sine');}
    // }


    manageZombieSound(shouldPlay) {

        if (shouldPlay) {

            if (this.zombieSoundIntervalId === null) {

                this.playZombieNear(); 

                this.zombieSoundIntervalId = setInterval(() => {

                    this.playZombieNear();

                }, 1000); 

            }

        } else {

            if (this.zombieSoundIntervalId !== null) {

                clearInterval(this.zombieSoundIntervalId);
                this.zombieSoundIntervalId = null;

            }
        }
    }

}

