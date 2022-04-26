export abstract class SelectTarget<T> {

    unsubscribe?: ()=> void;
    chainNext?: (arg: T) => boolean;

    abstract use(chainNext: (arg: T) => boolean): void;

    abstract complete(): void;

    cancel(){
        this.unsubscribe?.();
    }

}