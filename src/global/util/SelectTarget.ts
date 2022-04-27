export abstract class SelectTarget<T> {

    unsubscribe?: ()=> void;
    chainNext?: (arg: T) => boolean;

    // Return ture if target is valid
    abstract use(next: (arg: T) => boolean): void;

    abstract complete(): void;

    cancel(){
        this.unsubscribe?.();
    }

}