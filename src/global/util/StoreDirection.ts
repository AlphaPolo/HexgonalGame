import { Hex, HexDirection } from "../../pages/Hex";
import { StoreTarget } from "./StoreTarget";

export class StoreDirection extends StoreTarget<HexDirection> {
  chainNext?: (direction: HexDirection) => boolean;
  direction: HexDirection;
  constructor(store: HexDirection) {
    super();
    this.direction = store;
  }

  use(chainNext: (hex: HexDirection) => boolean) {
    this.chainNext = chainNext;
    this.chainNext(this.direction);
  }

  getStore() {
    return this.direction;
  }

  complete() {
    this.unsubscribe?.();
  }
}
