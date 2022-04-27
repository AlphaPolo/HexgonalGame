import { getNeighbors, Hex } from "../../../pages/Hex";
import { GameManager } from "../../GameManager";
import { SelectHex } from "../../util/SelectHex";
import { CompleteType, StandardCharacter } from "../StandardCharacter";
import { BaseAbility, CardAbility, EffectType } from "./CardAbility";


export class MoveAbility extends BaseAbility {
    effect = EffectType.MOVEMENT;
    owner?: StandardCharacter;
    byAction?: string;

    constructor() {
        super();
        this.onHexClick = this.onHexClick.bind(this);
    }

    setAction(action: string) {
        this.byAction = action;
    }

    process(listener?: () => void): void {
        if (!this.owner)
            return;

        if (!this.owner.position) {
            console.log("Target not on hex");
            return;
        }

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
            this.unsubscribe = null;
        };
        console.log("CardUse");
    }

    onHexClick(hex: Hex) {
        if (!this.owner)
            return true;
        // console.log("OnClick");
        let targetP = this.owner.position;
        let neighbor = getNeighbors(hex);
        if (neighbor.find(neighborHex => neighborHex.q === targetP?.q &&
            neighborHex.r === targetP.r &&
            neighborHex.s === targetP.s
        )) {
            let units = GameManager.getInstance().getAllUnitOnBoard();
            if(units.map(unit => unit.position).find(unitHex => unitHex?.q === hex.q &&
                unitHex?.r === hex.r &&
                unitHex?.s === hex.s))
            {
                console.log("Already has unit");
                return false;
            }
            // console.log("neighbor", hex);
            this.canCancel = false;
            let com = () => {
                this.complete();
                console.log("Animation Complete");
                this.owner?.detachComplete(CompleteType.MOVING, com);
            }
            this.owner.waitForComplete(CompleteType.MOVING, com)
            this.owner.moveTo(hex, this.byAction);
            return true;
        }

        else {
            console.log("Not neighbor");
            return false;
        }
    }

}
