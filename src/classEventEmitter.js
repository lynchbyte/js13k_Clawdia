export class EventEmitter {  //thank you Gemini
    
    constructor() {

        this.eventListeners = {}; 

    }

    on(eventName, listener) {

        if (!this.eventListeners[eventName]) {

            this.eventListeners[eventName] = [];

        }
        this.eventListeners[eventName].push(listener);

        return () => this.off(eventName, listener);

    }
    
    off(eventName, listener) {

        if (!this.eventListeners[eventName]) {

            return; 
            
        }

        const index = this.eventListeners[eventName].indexOf(listener);

        if (index > -1) {

            this.eventListeners[eventName].splice(index, 1);

        }

    }

    emit(eventName, ...args) {
        
        if (!this.eventListeners[eventName]) {

            return; 
            
        }

        // Make a shallow copy of the listeners array
        const listeners = [...this.eventListeners[eventName]];

        for (const listener of listeners) {

            try {
                
                
                listener.call(this, ...args);

            } catch (e) {

              //  console.error(`Error in event listener for '${eventName}':`, e);

            }

        }

    }
    
    waitOnce(eventName, timeout = 10000) {

        return new Promise((resolve, reject) => {

            let timeoutId;

            const listener = (...args) => {

                clearTimeout(timeoutId);
                this.off(eventName, listener);
                resolve(...args);

            };

            this.on(eventName, listener);

            timeoutId = setTimeout(() => {

                this.off(eventName, listener);
                reject(new Error(`Timeout '${eventName}' , ${timeout}ms.`));

            }, timeout);

        });

    }

}

