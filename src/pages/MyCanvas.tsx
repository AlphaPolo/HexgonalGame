import React from "react";
import { GameManager } from "../global/GameManager";
import { DeckDiv } from "../global/model/DeckDiv";
import { Obserable } from "../global/model/Obserable";
import { RedHood } from "../global/model/Redhood";
import { FPS } from "../global/const/MyConst";
import { CanvasSizeState, Point, Rect, Hex, OnCurrentHexChange, CubeDirection, getCubeNeighbor, Cube, checkSameHex, OnHexClick, HexDirection, cubeRound } from "./Hex";
import "../index.css";
import { StandardCharacter } from "../global/model/StandardCharacter";
import { SelectUnit } from "../global/util/SelectUnit";
import { Demon } from "../global/model/Demon";
import { TestSelect } from "../global/util/TestSelect";
import HexPad from "./HexPad";

class MyCanvas extends React.Component<any, { canvasSize: CanvasSizeState, hexSize: number, startHexPoint: Point}> {

    canvasHex: React.RefObject<HTMLCanvasElement> = React.createRef();
    canvasCoordinates: React.RefObject<HTMLCanvasElement> = React.createRef();
    canvasGameObjectRender: React.RefObject<HTMLCanvasElement> = React.createRef();
    canvasDeck: React.RefObject<HTMLCanvasElement> = React.createRef();
    canvasBounds: Rect = {left: 0, right: 0, top: 0 ,bottom: 0}
    preHex?: Hex;
    currentHex?: Hex;
    animationID: any;
    
    redhood = new RedHood(0, 0, 0);
    demon = new Demon(0, 0, 0);
    
    gameObjects: StandardCharacter[] = [this.redhood, this.demon];
    
    // private onHexChange: OnCurrentHexChange[] = [];
    oHexChange = new Obserable<OnCurrentHexChange>();
    oHexClick = new Obserable<OnHexClick>();

    preDraw: Hex[] = [];
    fps: number = 0;
    fpsInterval: number = 0;
    startTime: number = 0;
    then: number = 0;

    drawMouseHex: OnCurrentHexChange = (pHex, cHex) => { 
        const ctx = this.canvasCoordinates.current?.getContext("2d");
        if(cHex && ctx)
        {
            ctx.clearRect(0, 0, this.state.canvasSize.canvasWidth, this.state.canvasSize.canvasHeight);
            this.preDraw.map(hex => this.hexToPixel(hex, this.state.startHexPoint))
                        .forEach(point => this.drawHex(ctx, point, "red", 3));
            let hexPoint = this.hexToPixel(cHex, this.state.startHexPoint);
            // this.drawNeighbor(ctx, cHex);
            this.drawHex(ctx, hexPoint, "green", 3);
        }
    }

    drawUpdate() {
        const ctx = this.canvasCoordinates.current?.getContext("2d");
        if(!ctx) return;
        ctx.clearRect(0, 0, this.state.canvasSize.canvasWidth, this.state.canvasSize.canvasHeight);
        this.preDraw.map(hex => this.hexToPixel(hex, this.state.startHexPoint))
                    .forEach(point => this.drawHex(ctx, point, "red", 3));
    }

    constructor(props: any) {
        super(props);
        GameManager.getInstance().setBoard(this);
        let width = 800;
        let height = 600;
        this.state = {
            canvasSize: {
                canvasWidth: width,
                canvasHeight: height
            },
            // center of canvas
            startHexPoint: {
                x: width / 2,
                y: height / 2
            },
            hexSize: 40
        }
        
        this.setFps(FPS);
        this.hexToPixel = this.hexToPixel.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.updateGameObjects = this.updateGameObjects.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
    }

    setFps(fps: number) {
        this.fps = fps;
        this.fpsInterval = 1000 / this.fps;
    }

    componentDidMount() {
        
        let ctx = this.canvasHex.current?.getContext("2d");
        let rect = this.canvasHex.current?.getBoundingClientRect();
        if (rect)
            this.canvasBounds = { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
        console.log("Rect", rect);
        if (ctx) {
            // let center = this.Point(50, 50);
            this.drawHexes(ctx);
        }
        this.oHexChange.attach(this.drawMouseHex);
        this.redhood.position = this.pixelToPointyHex(this.state.startHexPoint);
        this.demon.position = getCubeNeighbor(this.redhood.position, HexDirection.NW);
        
        this.then = Date.now();
        this.startTime = this.then;
        this.animationID = requestAnimationFrame(this.gameLoop);

        // let t = new TestSelect();
        // t.use((hex) => {
        //     console.log("TestSelect", hex);
        //     return false;
        // })
    }
    
    gameLoop() {
        // console.log("Loop");
        
        let now = Date.now();
        let elapsed = now - this.then;

        // if enough time has elapsed, draw the next frame

        if (elapsed > this.fpsInterval) {
            this.then = now - (elapsed % this.fpsInterval);
            this.updateGameObjects();
            this.drawGameObjects();
        }

        this.animationID = requestAnimationFrame(this.gameLoop);
    }

    updateGameObjects() {
        this.gameObjects.forEach((obj) => obj.updateGameObject());
    }

    drawGameObjects() {
        const ctx = this.canvasGameObjectRender.current?.getContext("2d");
        if(!ctx) return;
        ctx.clearRect(0, 0, this.state.canvasSize.canvasWidth, this.state.canvasSize.canvasHeight);
        this.gameObjects.forEach((obj) => obj.draw(ctx, this.state.startHexPoint, this.hexToPixel))
    }

    componentWillUnmount() {
        this.oHexChange.clear();
        this.oHexClick.clear();
        cancelAnimationFrame(this.animationID);
    }

    drawHexes(ctx: CanvasRenderingContext2D) {
        let start = this.state.startHexPoint;
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const { hexWidth, hexHeight, vertDist, horizDist } = this.getHexParameters();
        let qLeftSide = Math.round(start.x / hexWidth) * 4;
        let qRightSide = Math.round(canvasWidth - start.x) / hexWidth * 2;
        let rTopSide = Math.round(start.y / (hexHeight / 2));
        let rBottomSide = Math.round((canvasHeight - start.y) / (hexHeight / 2));
        for (let r = -rTopSide; r <= rBottomSide; r++) {
            for (let q = -qLeftSide; q <= qRightSide; q++) {
                // console.log(r, q)
                let cube = this.axialToCube(new Hex(q, r));
                let hex = this.cubeToOddr(cube);
                const point = this.hexToPixel(hex, start);
                if ((point.x > hexWidth / 2 && point.x < canvasWidth - hexWidth / 2) &&
                    point.y > hexHeight / 2 && point.y < canvasHeight - hexHeight / 2) {
                    this.drawHex(ctx, point)
                    // this.drawHexCoordinates(ctx, point, hex);
                }

            }
        }
    }

    drawHex(ctx: CanvasRenderingContext2D, center: Point, color?: string, strokeWidth?: number) {
        for (let i = 0; i <= 5; i++) {
            let start = this.getHexCornerCoord(center, i);
            let end = this.getHexCornerCoord(center, i + 1);
            this.drawLine(ctx, start, end, color, strokeWidth);
        }
    }

    drawNeighbor(ctx: CanvasRenderingContext2D, centerHex: Hex) {
        const size = CubeDirection.length;
        for (let direction = 0; direction < size; direction++) {
            const neighborHex = getCubeNeighbor(centerHex, direction);
            const neighborPoint = this.hexToPixel(neighborHex, this.state.startHexPoint);
            this.drawHex(ctx, neighborPoint, "red", 3);
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string = "black", strokeWidth: number = 1) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    drawHexCoordinates(ctx: CanvasRenderingContext2D, center: Point, hex: Hex) {
        ctx.fillText(hex.q.toString(), center.x - 12, center.y - 5);
        ctx.fillText(hex.r.toString(), center.x + 8, center.y - 5);
        ctx.fillText(hex.s.toString(), center.x - 4, center.y + 10);
    }

    getHexCornerCoord(center: Point, i: number) {
        let angle_deg = 60 * i + 30;
        let angle_rad = Math.PI / 180 * angle_deg
        let x = center.x + this.state.hexSize * Math.cos(angle_rad);
        let y = center.y + this.state.hexSize * Math.sin(angle_rad);
        return this.Point(x, y);
    }

    getHexParameters() {
        let hexHeight = this.state.hexSize * 2;
        let hexWidth = Math.sqrt(3) / 2 * hexHeight;
        let vertDist = hexHeight * 3 / 4;
        let horizDist = hexWidth;
        return { hexWidth, hexHeight, vertDist, horizDist };
    }

    hexToPixel(hex: Hex, offset?: Point) {
        let x = this.state.hexSize * Math.sqrt(3) * (hex.q + hex.r / 2) + (offset?.x || 0);
        let y = this.state.hexSize * 3 / 2 * hex.r + (offset?.y || 0);
        return this.Point(x, y)
    }

    pixelToPointyHex(point: Point) {
        let offset = this.state.startHexPoint;
        let size = this.state.hexSize;
        let q = ((point.x - offset.x) * Math.sqrt(3)/3 - (point.y - offset.y) / 3) / size;
        let r = (point.y - offset.y) * 2/3 / size;
        return new Hex(q, r);
    }


    axialToCube(hex: Hex): Cube {
        let x = hex.q;
        let z = hex.r;
        let y = -x - z;
        return { q: x, r: y, s: z }
    }

    // cubeToAxial(hex: Hex): Hex {
    //     var q = hex.q
    //     var r = hex.r
    //     return Axial(q, r)
    // }

    cubeToOddr(c: Cube): Hex {
        let q = c.q - (c.s - (c.s & 1)) / 2;
        let r = c.s;
        return { q: q, r: r, s: -q-r}
    }

    // axial_round(hex: Hex) {
    //     return cube_to_axial(cube_round(axial_to_cube(hex)))
    // }
    // oddRowOffsetToPixel(hex: Hex) {
    //     let x = this.state.hexSize * Math.sqrt(3) * (hex.col + 0.5 * (hex.row&1))
    //     let y = this.state.hexSize * 3/2 * hex.row;
    //     return this.Point(x, y);
    // }

    Point(x: number, y: number): Point {
        return { x: x, y: y };
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvasHex} height={this.state.canvasSize.canvasHeight} width={this.state.canvasSize.canvasWidth} />
                <canvas ref={this.canvasCoordinates} height={this.state.canvasSize.canvasHeight} width={this.state.canvasSize.canvasWidth}/>
                <canvas ref={this.canvasGameObjectRender} height={this.state.canvasSize.canvasHeight} width={this.state.canvasSize.canvasWidth}
                onMouseMove={this.handleMouseMove}
                onMouseDown={this.handleMouseDown}/>
                {/* <canvas className="pad" height="300px" width="300px" style={{left: this.state.canvasSize.canvasWidth + 2, top: this.state.canvasSize.canvasHeight - 300}}/> */}
                <HexPad height={300} width={300} top={this.state.canvasSize.canvasHeight - 300} left={this.state.canvasSize.canvasWidth + 2} />
                <DeckDiv style={{height: "250px", width: this.state.canvasSize.canvasWidth + 302, left: 0, top: this.state.canvasSize.canvasHeight + 2}}/>
                {/* <canvas ref={this.canvasDeck}
                    className="deck" height="250px" width={this.state.canvasSize.canvasWidth + 302} style={{left: 0, top: this.state.canvasSize.canvasHeight + 2}}/> */}
            </div>
        )
    }

    handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        let ctx = this.canvasCoordinates.current?.getContext("2d");
        if(ctx == null) return;
        let pointOnCanvas = {
            x: e.pageX - this.canvasBounds.left,
            y: e.pageY - this.canvasBounds.top
        }
        let floatHex = this.pixelToPointyHex(pointOnCanvas);
        let cube = cubeRound(floatHex);
        let roundHex = new Hex(cube.q, cube.r);
        // let hexPoint = this.hexToPixel(roundHex, this.state.startHexPoint);
        
        // on hex change
        if(checkSameHex(this.currentHex, roundHex) == false)
        {
            this.preHex = this.currentHex;
            this.currentHex = roundHex;
            // this.drawHex(ctx, hexPoint, "Green", 2);
            this.oHexChange.notify([this.preHex, this.currentHex]);
            // console.log("Call Draw");
        }
        // console.log(e.pageX - this.canvasBounds.left, e.pageY - this.canvasBounds.top);
        // console.log(cube);
        // console.log(this.canvasBounds);
    }

    handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        let ctx = this.canvasCoordinates.current?.getContext("2d");
        if(ctx == null) return;
        let pointOnCanvas = {
            x: e.pageX - this.canvasBounds.left,
            y: e.pageY - this.canvasBounds.top
        }
        let floatHex = this.pixelToPointyHex(pointOnCanvas);
        let cube = cubeRound(floatHex);
        let roundHex = new Hex(cube.q, cube.r);
        // this.drawHex(ctx, hexPoint, "Green", 2);
        this.oHexClick.notify([roundHex, e.nativeEvent.button]);
    }

    pushPreDraw(...hexes: Hex[]) {
        this.preDraw = [...this.preDraw, ...hexes];
    }

    clearPreDraw() {
        this.preDraw = [];
    }

}

export default MyCanvas;