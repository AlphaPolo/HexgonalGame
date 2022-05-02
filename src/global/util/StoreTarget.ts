import { SelectTarget } from "./SelectTarget";

export abstract class StoreTarget<T> extends SelectTarget<T> {
  abstract getStore(): T;
}
