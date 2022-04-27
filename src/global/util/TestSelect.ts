import { Hex } from "../../pages/Hex";
import { GameManager } from "../GameManager";
import { SelectTarget } from "./SelectTarget";

export class TestSelect extends SelectTarget<Hex> {
    
    chainNext?: (hex: Hex) => boolean;

    constructor() {
        super();
        this.onHexPromise = this.onHexPromise.bind(this);
    }

    use(chainNext: (hex: Hex) => boolean) {
        let board = GameManager.getInstance().getBoard();
        if(!board) {
            console.log("Board not exist");
            return;
        }

        this.chainNext = chainNext;

        new Promise((resolve, reject) => {
            let callback = (hexOnclick: Hex, mouse: number) => this.onHexPromise(resolve, reject, hexOnclick, mouse);
            GameManager.getInstance().attachOnHexClick(callback);
            this.unsubscribe = () => {
                reject("unsubscribe");
                GameManager.getInstance().detachOnHexClick(callback);
            }
        }).then((hex) => chainNext(hex as Hex))

        // GameManager.getInstance().attachOnHexClick(this.onHexClick);
        // this.unsubscribe = () => {
        //     GameManager.getInstance().detachOnHexClick(this.onHexClick);
        // }

    }

    onHexPromise(resolve: (value: unknown) => void, reject: (reason?: any) => void, hex: Hex, mouse: number) {
        if(mouse != 0) return;
        resolve(hex);
    }

    // onHexClick(hex: Hex, mouse: number) {
    //     if(mouse != 0) return;

    //     let success = this.chainNext?.(hex) ?? true;
    //     if(success) this.complete();
    // }

    complete() {
        this.unsubscribe?.();
    }

}