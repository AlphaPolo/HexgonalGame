import { Card, CardType } from "./Card";
import dash from "../assets/dash.jpg"
import attack from "../assets/attack.png"
import { ActiveType, AimType } from "./ability/CardAbility";
import { MoveAbility } from "./ability/MoveAbility";
import { AttackAbility } from "./ability/AttackAbility";

export const CardList: Card[] = [
    new Card(CardType.COMMON, 0, "移動", "使用此卡片可在戰場上進行移動", 1, dash, new MoveAbility()),
    new Card(CardType.ACTION, 1, "迴避", "使用此卡片可進行迴避", 2, dash, new MoveAbility().then(new MoveAbility()).then(new MoveAbility()).toTop(), "slide"),
    new Card(CardType.ACTION, 2, "攻擊", "使用此卡片可進行攻擊", 1, attack, new AttackAbility(ActiveType.CLICK, AimType.DIRECTION))
]