import { Hex } from "../../pages/Hex";
import { GameManager } from "../GameManager";
import { SelectTarget } from "./SelectTarget";

export class SelectHex extends SelectTarget<Hex> {
    
    chainNext?: (hex: Hex) => boolean;

    constructor() {
        super();
        this.onHexClick = this.onHexClick.bind(this);
    }

    use(chainNext: (hex: Hex) => boolean) {
        let board = GameManager.getInstance().getBoard();
        if(!board) {
            console.log("Board not exist");
            return;
        }

        this.chainNext = chainNext;

        GameManager.getInstance().attachOnHexClick(this.onHexClick);
        this.unsubscribe = () => {
            GameManager.getInstance().detachOnHexClick(this.onHexClick);
        }

    }

    onHexClick(hex: Hex, mouse: number) {
        if(mouse != 0) return;

        let success = this.chainNext?.(hex) ?? true;
        if(success) this.complete();
    }

    complete() {
        this.unsubscribe?.();
    }

}