import { checkSameHex, CubeDirection, Hex } from "../../pages/Hex";
import { GameManager } from "../GameManager";
import { SelectTarget } from "./SelectTarget";

export class SelectDirection extends SelectTarget<Hex> {
    
    chainNext?: (hex: Hex) => boolean;

    constructor() {
        super();
        this.onDirectionClick = this.onDirectionClick.bind(this);
    }

    use(chainNext: (hex: Hex) => boolean) {
        let board = GameManager.getInstance().getBoard();
        if(!board) {
            console.log("Board not exist");
            return;
        }

        this.chainNext = chainNext;

        GameManager.getInstance().attachOnDirectionClick(this.onDirectionClick);
        this.unsubscribe = () => {
            GameManager.getInstance().detachOnDirectionClick(this.onDirectionClick);
        }

    }

    onDirectionClick(hex: Hex, mouse: number) {
        if(mouse != 0) return;
        if(!CubeDirection.find(dir => checkSameHex(dir, hex))) return;
        let success = this.chainNext?.(hex) ?? true;
        if(success) this.complete();
    }

    complete() {
        this.unsubscribe?.();
    }

}