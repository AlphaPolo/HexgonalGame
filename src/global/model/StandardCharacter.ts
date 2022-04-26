import { Hex, Point } from "../../pages/Hex";

export class StandardCharacter {

    position: Hex | null | undefined;

    hp: number;
    mp: number;
    stamina: number;

    constructor(hp: number, mp: number, stamina: number) {
        this.hp = hp;
        this.mp = mp;
        this.stamina = stamina;
    }

    draw(ctx: CanvasRenderingContext2D, startPoint: Point, callback: any) {

    }

    callAction(action: string, ...arg: any) {

    }

    moveTo(hex: Hex, byAction?: string) {

    }

    attackTo(hexOrUnit: Hex | StandardCharacter) {

    }

    updateGameObject() {

    }

}
