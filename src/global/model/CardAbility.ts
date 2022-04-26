import { getCubeNeighbor, getNeighbors, Hex } from "../../pages/Hex";
import { GameManager } from "../GameManager";
import { SelectHex } from "../util/SelectHex";
import { RedHood } from "./Redhood";
import { StandardCharacter } from "./StandardCharacter";

export enum TargetType {
    SELF,
    ENEMY,
    ALLY
}

export enum EffectType {
    MOVEMENT,
    DAMAGE,
    HEAL,
    INVINCIBLE
}

// Ability require type
export enum RequireType {
    HEX,
    UNIT,
    NONE,
}

// How to get requireType
export enum ActiveType {
    CLICK,
    PASSIVE
}

export interface CardAbility {
    use(complete?: () => void): void;
    cancel(): void;
    setOwner(unit: StandardCharacter): void;
}

export class AbilityAim implements CardAbility {

    owner?: StandardCharacter;
    ability?: CardAbility;
    requireType: RequireType;

    constructor(require: RequireType) {
        this.requireType = require;
    }

    setOwner(unit: StandardCharacter): void {
        this.owner = unit;
    }

    use(): void {
        throw new Error("Method not implemented.");
    }

    cancel(): void {
        throw new Error("Method not implemented.");
    }

}

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
        if(!this.owner) return;

        if(!this.owner.position) {
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
        this.unsubscribe = () => 
        {
            selecting.cancel();
            board?.clearPreDraw();
            board?.drawUpdate();
        }
        console.log("CardUse");
    }

    onHexClick(hex: Hex) {
        if(!this.owner) return true;
        console.log("OnClick");
        let targetP = this.owner.position;
        let neigbor = getNeighbors(hex);
        if(neigbor.find(hex => 
            hex.q === targetP?.q &&
            hex.r === targetP.r &&
            hex.s === targetP.s
        )){
            console.log("neighbor", hex);
            // this.target.position = hex;
            this.owner.moveTo(hex, this.byAction);
            this.complete();
            return true;
        }
        else
        {
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


export class AttackAbility implements CardAbility {

    owner?: StandardCharacter;
    activeType: ActiveType;
    unsubscribe?: () => void;
    completeListener?: () => void;
    
    constructor(activeType: ActiveType) {
        this.activeType = activeType;
        this.onHexClick = this.onHexClick.bind(this);
    }

    setOwner(unit: StandardCharacter): void {
        this.owner = unit;
    }

    
    use(listener?: () => void): void {
        if(!this.owner) return;

        if(!this.owner.position) {
            console.log("Target not on hex");
            return;
        }
        this.completeListener = listener;

        let selecting = new SelectHex();
        selecting.use(this.onHexClick);
    
        let board = GameManager.getInstance().getBoard();
        let neighbors = getNeighbors(this.owner.position);
        board?.pushPreDraw(...neighbors);
        board?.drawUpdate();
        this.unsubscribe = () => 
        {
            selecting.cancel();
            board?.clearPreDraw();
            board?.drawUpdate();
        }
    }

    onHexClick(hex: Hex) {
        if(!this.owner) return true;
        console.log("OnClick");
        let targetP = this.owner.position;
        let neigbor = getNeighbors(hex);
        if(neigbor.find(hex => 
            hex.q === targetP?.q &&
            hex.r === targetP.r &&
            hex.s === targetP.s
        )){
            this.owner.attackTo(hex);
            this.complete();
            return true;
        }
        else
        {
            return false;
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