import { getCubeNeighbor } from "../../../pages/Hex";
import { RedHood } from "../Redhood";
import { StandardCharacter } from "../StandardCharacter";

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

export enum AimType {
    HEX,
    UNIT,
    POSITION
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