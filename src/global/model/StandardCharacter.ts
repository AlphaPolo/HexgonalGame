import { Hex, Point } from "../../pages/Hex";
import { Obserable } from "./Obserable";

export enum CompleteType {
    MOVING,
    ATTACKING
}

export class StandardCharacter {

    position: Hex | null | undefined;

    hp: number;
    mp: number;
    stamina: number;

    subscribes = new Map<CompleteType, Obserable<() => void>>();

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

    waitForComplete(type: CompleteType, complete: () => void) {
        
        if(this.subscribes.has(type))
            this.subscribes.get(type)?.attach(complete);
        else
        {
            let o = new Obserable<() => void>();
            o.attach(complete);
            this.subscribes.set(type, o);
        }
    }

    detachComplete(type: CompleteType, complete: () => void) {
        this.subscribes.get(type)?.detach(complete);
    } 

    protected notifyComplete(type: CompleteType) {
        this.subscribes.get(type)?.notify([]);
    }

}
