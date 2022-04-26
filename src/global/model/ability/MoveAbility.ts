import { getNeighbors, Hex } from "../../../pages/Hex";
import { GameManager } from "../../GameManager";
import { SelectHex } from "../../util/SelectHex";
import { StandardCharacter } from "../StandardCharacter";
import { CardAbility, EffectType } from "./CardAbility";


export class MoveAbility implements CardAbility {
    effect = EffectType.MOVEMENT;
    owner?: StandardCharacter;
    unsubscribe?: () => void;
    completeListener?: () => void;
    byAction?: string;

    constructor() {
        this.onHexClick = this.onHexClick.bind(this);
    }

    setOwner(target: StandardCharacter) {
        this.owner = target;
    }

    setAction(action: string) {
        this.byAction = action;
    }

    use(listener?: () => void): void {
        if (!this.owner)
            return;

        if (!this.owner.position) {
            console.log("Target not on hex");
            return;
        }

        this.completeListener = listener;

        let selecting = new SelectHex();
        selecting.use(this.onHexClick);

        // GameManager.getInstance().attachOnHexClick(this.onHexClick);
        let board = GameManager.getInstance().getBoard();
        let neighbors = getNeighbors(this.owner.position);
        board?.pushPreDraw(...neighbors);
        board?.drawUpdate();
        this.unsubscribe = () => {
            selecting.cancel();
            board?.clearPreDraw();
            board?.drawUpdate();
        };
        console.log("CardUse");
    }

    onHexClick(hex: Hex) {
        if (!this.owner)
            return true;
        console.log("OnClick");
        let targetP = this.owner.position;
        let neigbor = getNeighbors(hex);
        if (neigbor.find(hex => hex.q === targetP?.q &&
            hex.r === targetP.r &&
            hex.s === targetP.s
        )) {
            console.log("neighbor", hex);
            // this.target.position = hex;
            this.owner.moveTo(hex, this.byAction);
            this.complete();
            return true;
        }

        else {
            console.log("Not neighbor");
            return false;
        }
    }

    complete() {
        console.log("CardComplete");
        this.unsubscribe?.();
        this.completeListener?.();
    }

    cancel(): void {
        console.log("CardCancel");
        this.unsubscribe?.();
    }
}
