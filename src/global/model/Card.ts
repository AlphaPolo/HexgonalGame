import { CardAbility } from "./ability/CardAbility";
import { CommandAbility } from "./ability/CommandAbility";
import { MoveAbility } from "./ability/MoveAbility";
import { StandardCharacter } from "./StandardCharacter";

export enum CardType {
  NONE,
  ACTION,
  COMMON
}

export class Card {
  owner?: StandardCharacter;
  type: CardType = CardType.NONE;
  id: number = -1;
  cardName: string = "";
  description: string = "";
  cost: number = 0;
  image: string = "";
  complete?: () => void;

  ability: CardAbility;
  src: any;

  constructor(
    type: CardType,
    id: number,
    cardName: string,
    description: string,
    cost: number,
    image: string,
    ability: CardAbility,
    action?: string,
    complete?: () => void
  ) {
    this.type = type;
    this.id = id;
    this.cardName = cardName;
    this.description = description;
    this.cost = cost;
    this.image = image;

    let img = new Image();
    img.src = this.image;
    img.onload = () => (this.src = img);

    this.ability = ability;
    // if(action) this.ability.setAction(action);
    this.complete = complete;
  }

  setComplete(complete: () => void) {
    this.complete = complete;
  }

  setOwner(owner: StandardCharacter) {
    this.owner = owner;
    this.ability.setOwner(this.owner);
  }

  use() {
    this.ability.use(() => {
      console.log("Ability complete");
      this.complete?.();
    });
  }

  cancel(): boolean {
    return this.ability.cancel() ? true : this.ability.isCompleted();
  }
}
