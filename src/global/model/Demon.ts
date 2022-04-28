import { CompleteType, StandardCharacter } from "./StandardCharacter";
import model from "../assets/demon.png";
import { Hex, hexToPoint, Point } from "../../pages/Hex";
import { FPS } from "../const/MyConst";
import { GameManager } from "../GameManager";


enum DemonState {
    IDLE,
    WALKING,
    CLEAVE,
    CLEAVE_PREPARE,
    CLEAVE_LOOP,
    CLEAVE_EXECUTE,
    HURT,
    DEATH,
}

export class Demon extends StandardCharacter {

    static idleFrames = {
        start: 0,
        total: 6
    };

    static walkingFrames = {
        start: 22,
        total: 12
    };

    static cleavePrepare = {
        start: 44,
        total: 8
    }

    static cleaveLoop = {
        start: 52,
        total: 1
    }

    static cleaveFrames = {
        start: 44,
        total: 15
    };

    static cleaveExecute = {
        start: 53,
        total: 6
    }

    static hurtFrames = {
        start: 66,
        total: 5
    };

    static deathFrames = {
        start: 88,
        total: 22
    };

    currentState: DemonState = DemonState.IDLE;

    currentUseAnimate = () => {
        switch (this.currentState) {
            case DemonState.IDLE: return Demon.idleFrames;
            case DemonState.WALKING: return Demon.walkingFrames;
            case DemonState.CLEAVE: return Demon.cleaveFrames;
            case DemonState.CLEAVE_PREPARE: return Demon.cleavePrepare;
            case DemonState.CLEAVE_LOOP: return Demon.cleaveLoop;
            case DemonState.CLEAVE_EXECUTE: return Demon.cleaveExecute;
            case DemonState.HURT: return Demon.hurtFrames;
            case DemonState.DEATH: return Demon.deathFrames;
            default: return Demon.idleFrames;
        }
    };
    
    constructor(hp: number, mp: number, stamina: number) {
        super(hp, mp, stamina);
        this.col = 22;
        this.row = 5;
        this.offsetY = 0;
        this.scale = 0.8;

        let img = new Image();
        img.src = model;
        img.onload = () => {
            this.width = img.width;
            this.height = img.height;
            this.spritesheet = img;

            this.perFrameW = this.width / this.col;
            this.perFrameH = this.height / this.row;

            this.renderFrameW = this.perFrameW * this.scale;
            this.renderFrameH = this.perFrameH * this.scale;
        }
        // this.position = hex;
    }

    draw(ctx: CanvasRenderingContext2D, startPoint: Point, callback: any) {
        if(!this.spritesheet) return;
        if(!this.position) return;
        let point = callback(this.position, startPoint);

        let flipX = this.facing;
        let flipY = 1;
        let midPosX = (this.renderFrameW * flipX) / 2;
        let midPosY = (this.renderFrameH * flipY) / 2;
        ctx.save();
        ctx.scale(flipX, flipY);

        // Lerp character to goal
        if(this.moving)
        {
            this.progress = Math.min(this.progress + this.perFpsP, 1);
            console.log("Moving", this.progress);
            let point2 = callback(this.moveTargetHex!, startPoint);
            point.x = point.x + (point2.x - point.x) * (this.progress);
            point.y = point.y + (point2.y - point.y) * (this.progress);
            if(this.progress >= 1)
            {
                this.moveComplete();
            }
        }
    
        ctx.drawImage(this.spritesheet,
            (this.currentAnimateFrame % this.col) * this.perFrameW,
            Math.floor(this.currentAnimateFrame / this.col) * this.perFrameH,
            this.perFrameW,
            this.perFrameH,
            (point.x - midPosX) * flipX,
            (point.y - this.renderFrameH + 10) * flipY,
            this.renderFrameW,
            this.renderFrameH);
        ctx.restore();
        
        return this.spritesheet;
    }
    
    updateGameObject(): void {
        
        this.frameIndex += 0.5;        
        let animate = this.currentUseAnimate();
        let start = animate.start;
        let total = animate.total;
        if(this.frameIndex > total - 1)
        {
            this.frameIndex = 0;
            this.animationComplete?.(this.currentState);
        }
        this.currentAnimateFrame = Math.trunc(this.frameIndex + start);
    }

    // callAction(action: string, ...arg: any): void {
    //     switch(action) {
    //         case "slide": 
    //             this.slide(arg[0]);
    //     }
    // }

    moveTo(hex: Hex, byAction?: string) {
        this.currentState = DemonState.WALKING;
        this.progress = 0;
        this.perFpsP = this.calcPerProgress(0.8);
        this.moveTargetHex = hex;
        this.moving = true;
        console.log("By", byAction);
        
        this.facingTo(this.moveTargetHex!);
    }

    attackTo(hexOrUnit: StandardCharacter | Hex): void {
        console.log("Attack To");
        let hex: Hex | null | undefined;
        if(hexOrUnit instanceof StandardCharacter)
        {
            hex = hexOrUnit.position;
        }
        else
        {
            hex = hexOrUnit;
        }
        if(!hex) return;
        
        this.currentState = DemonState.CLEAVE_PREPARE;
        this.frameIndex = 0;
        this.animationComplete = (state) => {
            GameManager.getInstance().getBoard()?.pushPreDraw(hex!);
            GameManager.getInstance().getBoard()?.drawUpdate();
            this.currentState = DemonState.CLEAVE_LOOP;
            this.frameIndex = Demon.cleavePrepare.total - 1;
            this.animationComplete = null;
        }
        this.facingTo(hex);
    }


    moveComplete() {

        this.currentState = DemonState.IDLE;
        this.moving = false;
        this.position = this.moveTargetHex;
        this.moveTargetHex = null;
        this.progress = 0;
        this.perFpsP = 0;
        this.notifyComplete(CompleteType.MOVING);
    }

}