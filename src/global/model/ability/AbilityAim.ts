import { SelectHex } from "../../util/SelectHex";
import { SelectUnit } from "../../util/SelectUnit";
import { StandardCharacter } from "../StandardCharacter";
import { CardAbility, AimType, BaseAbility } from "./CardAbility";


export class AbilityAim extends BaseAbility {
    unsubscribe?: () => void;
    owner?: StandardCharacter;
    ability?: CardAbility;
    aimType: AimType;

    constructor(type: AimType) {
        super();
        this.aimType = type;
        this.valid = this.valid.bind(this);
    }

    process(listener?: () => void): void {
        let selecting;
        switch (this.aimType) {
            case AimType.HEX: selecting = new SelectHex(); break;
            case AimType.UNIT: selecting = new SelectUnit(); break;
        }

        selecting?.use(this.valid);
    }

    valid(arg: any): boolean {
        return false;
    }

}
