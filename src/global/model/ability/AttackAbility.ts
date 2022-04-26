import { cubeDistance, getNeighbors, Hex } from "../../../pages/Hex";
import { SelectHex } from "../../util/SelectHex";
import { SelectTarget } from "../../util/SelectTarget";
import { SelectUnit } from "../../util/SelectUnit";
import { StandardCharacter } from "../StandardCharacter";
import { CardAbility, ActiveType, AimType, TargetType } from "./CardAbility";



export class AttackAbility implements CardAbility {

    owner?: StandardCharacter;
    activeType: ActiveType;
    aimType: AimType = AimType.UNIT;
    targetType: TargetType = TargetType.ENEMY;
    unsubscribe?: () => void;
    completeListener?: () => void;

    constructor(activeType: ActiveType, aimType?: AimType, targetType?: TargetType) {
        this.activeType = activeType;
        this.aimType = aimType ?? this.aimType;
        this.targetType = targetType ?? this.targetType;
        this.onHexClick = this.onHexClick.bind(this);
        this.onUnitClick = this.onUnitClick.bind(this);
    }

    setOwner(unit: StandardCharacter): void {
        this.owner = unit;
    }


    use(listener?: () => void): void {
        if (!this.owner)
            return;

        if (!this.owner.position) {
            console.log("Target not on hex");
            return;
        }
        this.completeListener = listener;

        let selecting: SelectTarget<any>;

        switch (this.aimType) {
            case AimType.HEX: selecting = new SelectHex(); selecting.use(this.onHexClick); break;
            case AimType.UNIT: selecting = new SelectUnit(); selecting.use(this.onUnitClick); break;
        }

        this.unsubscribe = () => {
            selecting?.cancel();
        };
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
            this.owner.attackTo(hex);
            this.complete();
            return true;
        }

        else {
            return false;
        }
    }

    onUnitClick(unit: StandardCharacter) {
        if (!this.owner)
            return true;
        console.log("OnClick");
        let dist = cubeDistance(this.owner.position!, unit.position!);
        if (dist > 1) {
            console.log("Too far", dist);
            return false;
        }

        else {
            this.owner.attackTo(unit);
            this.complete();
            return true;
        }
    }

    complete() {
        this.unsubscribe?.();
        this.completeListener?.();
    }

    cancel(): void {
        this.unsubscribe?.();
    }

}
