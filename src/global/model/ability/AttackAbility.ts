import { cubeAdd, cubeDistance, getNeighbors, Hex } from "../../../pages/Hex";
import { SelectDirection } from "../../util/SelectDirection";
import { SelectHex } from "../../util/SelectHex";
import { SelectTarget } from "../../util/SelectTarget";
import { SelectUnit } from "../../util/SelectUnit";
import { StandardCharacter } from "../StandardCharacter";
import { CardAbility, ActiveType, AimType, TargetType, BaseAbility } from "./CardAbility";



export class AttackAbility extends BaseAbility {

    owner?: StandardCharacter;
    activeType: ActiveType;
    aimType: AimType = AimType.UNIT;
    targetType: TargetType = TargetType.ENEMY;

    constructor(activeType: ActiveType, aimType?: AimType, targetType?: TargetType) {
        super();
        this.activeType = activeType;
        this.aimType = aimType ?? this.aimType;
        this.targetType = targetType ?? this.targetType;
        this.onHexClick = this.onHexClick.bind(this);
        this.onUnitClick = this.onUnitClick.bind(this);
        this.onDirectionClick = this.onDirectionClick.bind(this);
    }

    process(listener?: () => void): void {
        if (!this.owner)
            return;

        if (!this.owner.position) {
            console.log("Target not on hex");
            return;
        }

        let selecting: SelectTarget<any>;

        switch (this.aimType) {
            case AimType.HEX: selecting = new SelectHex(); selecting.use(this.onHexClick); break;
            case AimType.UNIT: selecting = new SelectUnit(); selecting.use(this.onUnitClick); break;
            case AimType.DIRECTION: selecting = new SelectDirection; selecting.use(this.onDirectionClick); break;
        }

        this.unsubscribe = () => {
            selecting?.cancel();
            this.unsubscribe = null;
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

    onDirectionClick(hex: Hex) {
        if (!this.owner)
            return true;
        let targetHex = cubeAdd(this.owner.position!, hex)
        this.owner.attackTo(targetHex);
        this.complete();
        return true;
    }

}
