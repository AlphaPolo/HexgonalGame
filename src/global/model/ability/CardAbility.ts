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
  POSITION,
  DIRECTION
}

// Ability require type
export enum RequireType {
  HEX,
  UNIT,
  NONE
}

// How to get requireType
export enum ActiveType {
  CLICK,
  PASSIVE
}

export interface CardAbility {
  next?: CardAbility;
  previous?: CardAbility;
  command?: CardAbility;
  concatCommand(ability: BaseAbility): void;
  toTop(): CardAbility;
  toLast(): CardAbility;
  use(complete?: (() => void) | null): void;
  cancel(): boolean;
  setOwner(unit: StandardCharacter): void;
  then(next: CardAbility): CardAbility;
  isCompleted(): boolean;
}

export abstract class BaseAbility implements CardAbility {
  canCancel: boolean = true;
  completed: boolean = false;
  owner?: StandardCharacter;
  next?: CardAbility;
  previous?: CardAbility;
  command?: CardAbility;
  unsubscribe?: (() => void) | null;
  completeListener?: (() => void) | null;

  toTop(): CardAbility {
    return this.previous?.toTop() ?? this;
  }

  toLast(): CardAbility {
    console.log("V");

    return this.next?.toLast() ?? this;
  }

  concatCommand(ability: BaseAbility): void {
    let top = this.toTop();
    let cmd = top.command ?? new CommandAbility(); // get Top's command if null create a new command
    let abi = cmd.next;
    let last;
    if (this.owner) cmd.setOwner(this.owner); // prevent command's owner is null

    // set command execute ability concat to last one
    if (abi) {
      console.log("start call");

      last = abi.toLast();

      console.log("end call");

      abi = last.then(ability);
    } else {
      abi = ability;
    }

    cmd.next = abi.toTop();
    top.command = cmd;
  }

  run(complete?: () => void) {
    this.toTop().use(complete);
  }

  use(complete?: () => void): void {
    this.completeListener = null;
    this.unsubscribe?.();
    this.preSettinig(complete);
    this.process(complete);
  }

  private preSettinig(complete?: () => void) {
    console.log("PreSetting", this.owner);

    if (this.owner) this.next?.setOwner(this.owner);
    this.completeListener = complete;
  }

  abstract process(complete?: () => void): void;

  cancel() {
    if (!this.canCancel) return false;
    this.unsubscribe?.();
    return true;
  }

  setOwner(unit: StandardCharacter): void {
    this.owner = unit;
  }

  isCompleted() {
    return this.completed;
  }

  complete() {
    this.unsubscribe?.();
    if (this.next != null) {
      this.canCancel = false;
      this.next.use(() => {
        this.completeListener?.();
        this.completed = true;
      });
    } else {
      this.completed = true;
      this.completeListener?.();
    }
  }

  then(next: CardAbility): CardAbility {
    next.previous = this;
    this.next = next;
    return this.next;
  }
}

export class CommandAbility extends BaseAbility {
  title: string = "移動";
  content: string = "到 (0, 0, 0)(0, 0, 0)(0, 0, 0)(0, 0, 0)(0, 0, 0)";

  constructor() {
    super();
  }

  process(complete?: () => void): void {
    this.complete();
  }
}
