import { Hex } from "../../pages/Hex";
import { GameManager } from "../GameManager";
import { StandardCharacter } from "../model/StandardCharacter";
import { SelectHex } from "./SelectHex";

export class SelectUnit {

    unsubscribe?: () => void;
    chainNext?: (unit: StandardCharacter) => boolean;

    constructor() {
        this.bindUnit = this.bindUnit.bind(this);
    }

    use(chainNext?: (unit: StandardCharacter) => boolean) {
        this.chainNext = chainNext;
        let selecting = new SelectHex();
        this.unsubscribe = () => {
            selecting?.cancel();
        };
        selecting.use(this.bindUnit);
    }

    bindUnit(hex: Hex) {
        let units = GameManager.getInstance().getAllUnitOnBoard();
        let find = units.find(unit => 
                    hex.q === unit.position?.q &&
                    hex.r === unit.position.r &&
                    hex.s === unit.position.s)
        if(!find) return false;

        let success = this.chainNext?.(find) ?? true;
        if(success) this.complete();
        return success;
    }

    complete() {
        // selecting will auto unsubcribe itself
        // this.unsubscribe?.();
    }

    cancel() {
        this.unsubscribe?.();
    }

}