const DEBUG = false;

export class Obserable<T extends (...arg: any) => void> {

    private observers: T[] = [];

    attach(observer: T) {
        const isExist = this.observers.includes(observer);
        if (isExist) {
            if(DEBUG) console.log('Observer has been attached already.');
            return;
        }

        if(DEBUG) console.log("Attached an observer.");
        this.observers.push(observer);
    }

    public detach(observer: T): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) {
            if(DEBUG) console.log('Nonexistent observer.');
            return;
        }

        this.observers.splice(observerIndex, 1);
        if(DEBUG) console.log("Detached an observer.");
    }

    // how to implement
    public notify(arg: Parameters<T>): void {
        if(DEBUG) console.log("Notifying observers...");
        for (const observer of this.observers) {
            observer(...arg);
        }
    }

    public clear() {
        this.observers = [];
    }
}