import { SelectHex } from "../../util/SelectHex";
import { SelectUnit } from "../../util/SelectUnit";
import { StandardCharacter } from "../StandardCharacter";
import { CardAbility, AimType } from "./CardAbility";


export class AbilityAim implements CardAbility {
    unsubscribe?: () => void;
    owner?: StandardCharacter;
    ability?: CardAbility;
    aimType: AimType;

    constructor(type: AimType) {
        this.aimType = type;
        this.valid = this.valid.bind(this);
    }

    setOwner(unit: StandardCharacter): void {
        this.owner = unit;
    }

    use(listener?: () => void): void {
        this.unsubscribe?.();

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

    complete() {
    }

    cancel(): void {
        this.unsubscribe?.();
    }

}
