import { getCubeNeighbor, HexDirection } from "../../../pages/Hex";
import { SelectDirection } from "../../util/SelectDirection";
import { StoreDirection } from "../../util/StoreDirection";
import { AttackAbility } from "./AttackAbility";
import {
  ActiveType,
  AimType,
  BaseAbility,
  EffectType,
  TargetType
} from "./CardAbility";

export class AttackCmdAbi extends BaseAbility {
  effect = EffectType.MOVEMENT;
  byAction?: string;
  // command?: BaseAbility;
  constructor() {
    super();
    this.onDirectionClick = this.onDirectionClick.bind(this);
  }

  setAction(action: string) {
    this.byAction = action;
  }

  process(listener?: () => void): void {
    if (!this.owner) return;

    if (!this.owner.position) {
      console.log("Target not on hex");
      return;
    }

    let selecting = new SelectDirection();
    selecting.use(this.onDirectionClick);

    this.unsubscribe = () => {
      selecting.cancel();
      this.unsubscribe = null;
    };
  }

  onDirectionClick(direction: HexDirection) {
    if (!this.owner) return true;
    // let targetHex = getCubeNeighbor(this.owner.position!, direction);
    this.concatCommand(
      new AttackAbility(
        ActiveType.PASSIVE,
        AimType.DIRECTION,
        TargetType.ENEMY,
        new StoreDirection(direction)
      )
    );
    this.complete();
    return true;
  }
}
