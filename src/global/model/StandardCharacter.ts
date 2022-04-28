import { Hex, hexToPoint, Point } from "../../pages/Hex";
import { FPS } from "../const/MyConst";
import { Obserable } from "./Obserable";

export enum CompleteType {
    MOVING,
    ATTACKING
}

export enum Facing {
    LEFT = 1,
    RIGHT = -1
}

export class StandardCharacter {

    position: Hex | null | undefined;

    hp: number;
    mp: number;
    stamina: number;

    spritesheet: HTMLImageElement | undefined;
    width: number = 0;
    height: number = 0;
    frameIndex: number = 0;
    col = 0;
    row = 0;
    offsetY = 0;
    perFrameW = 0;
    perFrameH = 0;
    renderFrameW = 0;
    renderFrameH = 0;
    scale = 1;
    facing: Facing = Facing.LEFT;
    // currentState: RedHoodState = RedHoodState.IDLE;
    currentAnimateFrame = 0;

    moving: boolean = false;
    moveTargetHex?: Hex | null;
    progress: number = 0;
    perFpsP: number = 0;


    subscribes = new Map<CompleteType, Obserable<() => void>>();
    animationComplete?: ((state: number) => void) | null;

    constructor(hp: number, mp: number, stamina: number) {
        this.hp = hp;
        this.mp = mp;
        this.stamina = stamina;
    }

    // Let you can scale animation frames
    calcPerProgress(second: number) {
        let perFpsProgress = 1 / FPS / second;
        return perFpsProgress;
    }

    facingTo(target: Hex) {
        let startP = hexToPoint(this.position!);
        let endP = hexToPoint(target);

        if ((endP.x - startP.x) > 1) {
            this.facing = Facing.RIGHT;
        }

        else {
            this.facing = Facing.LEFT;
        }
    }

    draw(ctx: CanvasRenderingContext2D, startPoint: Point, callback: any) {

    }

    callAction(action: string, ...arg: any) {

    }

    moveToSamePlace(target: Hex, byAction?: string) {
        this.moveTo(this.position!, byAction);
        this.facingTo(target);
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
