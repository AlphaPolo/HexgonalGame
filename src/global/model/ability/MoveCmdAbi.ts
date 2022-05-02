import { HexDirection } from "../../../pages/Hex";
import { SelectDirection } from "../../util/SelectDirection";
import { StoreDirection } from "../../util/StoreDirection";
import { BaseAbility, EffectType } from "./CardAbility";
import { MoveAbility } from "./MoveAbility";

export class MoveCmdAbi extends BaseAbility {
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
    // console.log("Set Owner");
    this.concatCommand(new MoveAbility(new StoreDirection(direction)));
    this.complete();
    return true;
  }
}
