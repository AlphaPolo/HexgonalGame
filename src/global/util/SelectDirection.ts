import {
  checkSameHex,
  CubeDirection,
  Hex,
  HexDirection
} from "../../pages/Hex";
import { GameManager } from "../GameManager";
import { SelectTarget } from "./SelectTarget";

export class SelectDirection extends SelectTarget<HexDirection> {
  chainNext?: (hex: HexDirection) => boolean;

  constructor() {
    super();
    this.onDirectionClick = this.onDirectionClick.bind(this);
  }

  use(chainNext: (hex: HexDirection) => boolean) {
    let board = GameManager.getInstance().getBoard();
    if (!board) {
      console.log("Board not exist");
      return;
    }

    this.chainNext = chainNext;

    GameManager.getInstance().attachOnDirectionClick(this.onDirectionClick);
    this.unsubscribe = () => {
      GameManager.getInstance().detachOnDirectionClick(this.onDirectionClick);
    };
  }

  onDirectionClick(hex: Hex, mouse: number) {
    if (mouse !== 0) return;
    let find = CubeDirection.findIndex((dir) => checkSameHex(dir, hex));
    if (find === -1) return;
    let success = this.chainNext?.(find as HexDirection) ?? true;
    if (success) this.complete();
  }

  complete() {
    this.unsubscribe?.();
  }
}
