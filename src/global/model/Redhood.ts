import { StandardCharacter } from "./StandardCharacter";
import model from "../assets/redhood.png";
import { Hex, hexToPoint, Point } from "../../pages/Hex";
import { FPS } from "../const/MyConst";


enum RedHoodState {
    IDLE,
    SLIDE,
    SHOOT,
    LIGHT_ATTACK,
    HEAVY_ATTACK,
    RUNNING,
    HURT
}

export class RedHood extends StandardCharacter {

    spritesheet: HTMLImageElement | undefined;
    width: number = 1463;
    height: number = 1344;
    frameIndex: number = 0;
    col = 12;
    row = 11;
    offsetY = 36;
    perFrameW = 0;
    perFrameH = 0;
    renderFrameW = 0;
    renderFrameH = 0;
    scale = 1.5;

    totalFrames = 127;

    facing: 1 | -1 = 1;

    static idleFrames = {
        start: 0,
        total: 1
    };

    static slideFrames = {
        start: 52,
        total: 4
    };

    static shootFrames = {
        start: 23,
        total: 10
        
    };

    static runningFrames = {
        start: 1,
        total: 24
    };

    static lightAttackFrames = {
        start: 56,
        total: 24
    };

    static heavyAttackFrames = {
        start: 79,
        total: 40
    };

    static hurt1Frames = {
        start: 120,
        total: 7
    };

    static hurt2Frames = {
        total: 7
    };

    currentState: RedHoodState = RedHoodState.IDLE;
    currentAnimateFrame = 0;
    counter = 0;
    threshold = 3;

    moving: boolean = false;
    moveTargetHex?: Hex | null;
    progress: number = 0;
    perFpsP: number = 0;

    animationComplete?: ((state: number) => void) | null;

    currentUseAnimate = () => {
        switch (this.currentState) {
            case RedHoodState.IDLE: return RedHood.idleFrames;
            case RedHoodState.RUNNING: return RedHood.runningFrames;
            case RedHoodState.SLIDE: return RedHood.slideFrames;
            case RedHoodState.SHOOT: return RedHood.shootFrames;
            case RedHoodState.LIGHT_ATTACK: return RedHood.lightAttackFrames;
            case RedHoodState.HEAVY_ATTACK: return RedHood.heavyAttackFrames;
            case RedHoodState.HURT: return RedHood.hurt1Frames;
            default: return RedHood.idleFrames;
        }
    };
    
    constructor(hp: number, mp: number, stamina: number) {
        super(hp, mp, stamina);
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
            ((point.y - midPosY) - (this.offsetY)) * flipY,
            this.renderFrameW,
            this.renderFrameH);
        ctx.restore();
        
        return this.spritesheet;
    }
    
    updateGameObject(): void {
        this.frameIndex ++;        
        let animate = this.currentUseAnimate();
        let start = animate.start;
        let total = animate.total;
        if(this.frameIndex > total - 1) 
        {
            this.frameIndex = 0;
            this.animationComplete?.(this.currentState);
        }
        this.currentAnimateFrame = this.frameIndex + start;
    }

    faceRight()
    {
        this.facing = -1;
    }

    faceLeft()
    {
        this.facing = 1;
    }

    calcPerProgress(second: number) {
        let perFpsProgress = 1 / FPS / second;
        return perFpsProgress;
    }

    // callAction(action: string, ...arg: any): void {
    //     switch(action) {
    //         case "slide": 
    //             this.slide(arg[0]);
    //     }
    // }

    moveTo(hex: Hex, byAction?: string) {
        this.currentState = RedHoodState.RUNNING;
        this.progress = 0;
        this.perFpsP = this.calcPerProgress(0.8);
        this.moveTargetHex = hex;
        this.moving = true;
        console.log("By", byAction);
        
        switch(byAction) {
            case "slide":
                this.currentState = RedHoodState.SLIDE;
                this.perFpsP = this.calcPerProgress(0.5);
        }

        this.facingTo(this.moveTargetHex!);
    }

    facingTo(target: Hex) {
        let startP = hexToPoint(this.position!);
        let endP = hexToPoint(target);

        if ((endP.x - startP.x) > 1) {
            this.faceRight();
        }

        else {
            this.faceLeft();
        }
    }

    attackTo(hexOrUnit: StandardCharacter | Hex): void {
        console.log("Attack To");
        let unit: StandardCharacter;
        let hex: Hex | null | undefined;
        if(hexOrUnit instanceof StandardCharacter)
        {
            unit = hexOrUnit;
            hex = hexOrUnit.position;
        }
        else
        {
            hex = hexOrUnit;
        }
        if(!hex) return;
        
        this.currentState = RedHoodState.LIGHT_ATTACK;
        this.frameIndex = 0;
        this.animationComplete = (state) => {
            this.currentState = RedHoodState.IDLE;
            this.frameIndex = RedHood.lightAttackFrames.total - 1;
            this.animationComplete = null;
        }
        this.facingTo(hex);
    }

    // slide(hex: Hex) {
        
    //     this.currentState = RedHoodState.SLIDE;
    //     this.progress = 0;
    //     this.perFpsP = this.calcPerProgress(0.5);
    //     this.moveTargetHex = hex;
    //     this.moving = true;

    //     let startP = hexToPoint(this.position!);
    //     let endP = hexToPoint(this.moveTargetHex!);

    //     if((endP.x - startP.x) > 1)
    //     {
    //         this.faceRight();
    //     }
    //     else
    //     {
    //         this.faceLeft();
    //     }
    // }

    moveComplete() {
        
        this.currentState = RedHoodState.IDLE;
        this.moving = false;
        this.position = this.moveTargetHex;
        this.moveTargetHex = null;
        this.progress = 0;
        this.perFpsP = 0;
    }

}