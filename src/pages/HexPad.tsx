import React, { RefObject } from "react";
import { GameManager } from "../global/GameManager";
import { Obserable } from "../global/model/Obserable";
import { checkSameHex, CubeDirection, cubeRound, genNeighbors, getCubeNeighbor, Hex, HexDirection, OnCurrentHexChange, OnHexClick, Point, Rect } from "./Hex";

interface HexPadProps {
    left: number;
    top: number;
    width: number;
    height: number;
}

class HexPad extends React.Component<HexPadProps> {

    padRef: RefObject<HTMLCanvasElement> = React.createRef();
    outRef: RefObject<HTMLCanvasElement> = React.createRef(); 

    padHexSize = 48;
    center: Point = { x: 0, y: 0};
    canvasBounds: Rect = {left: 0, right: 0, top: 0 ,bottom: 0}
    currentHex: Hex | undefined;
    preHex: Hex | undefined;
    oHexChange: Obserable<OnCurrentHexChange> = new Obserable();
    oHexClick: Obserable<OnHexClick> = new Obserable();

    constructor(props: any) {
        super(props);
        GameManager.getInstance().setPad(this);
        this.drawMouseHex = this.drawMouseHex.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    componentDidMount() {
        let ctx = this.padRef.current?.getContext("2d");
        let rect = this.padRef.current?.getBoundingClientRect();
        if (rect)
            this.canvasBounds = { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
        this.center = {
            x: this.props.width / 2,
            y: this.props.height/ 2
        }
        if(ctx)
        {
            this.drawPad(ctx);
        }
        this.oHexChange.attach(this.drawMouseHex);
    }

    componentWillUnmount() {
        this.oHexChange.clear();
        this.oHexClick.clear();
    }

    drawMouseHex: OnCurrentHexChange = (pHex, cHex) => { 
        const ctx = this.outRef.current?.getContext("2d");
        if(cHex && ctx)
        {
            ctx.clearRect(0, 0, this.props.width, this.props.height);
            let hexPoint = this.hexToPixel(cHex);
            // this.drawNeighbor(ctx, cHex);
            this.drawHex(ctx, hexPoint, "red", 3);
        }
    }

    drawPad(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "20px Arial";
        this.drawNeighbor(ctx, new Hex(0, 0, 0))
    }

    drawNeighbor(ctx: CanvasRenderingContext2D, centerHex: Hex) {
        const size = CubeDirection.length;
        // for (let direction = 0; direction < size; direction++) {
        //     const neighborHex = getCubeNeighbor(centerHex, direction);
        //     const neighborPoint = this.hexToPixel(neighborHex);
        //     this.drawHex(ctx, neighborPoint, "blue", 2);
        // }

        let neighbors = genNeighbors(centerHex);
        let n;
        while((n = neighbors.next()).done == false)
        {
            console.log(n);
            let hex = n.value.hex;
            const neighborPoint = this.hexToPixel(hex);
            this.drawHex(ctx, neighborPoint, "blue", 2);
            this.drawDirectionText(ctx, neighborPoint, n.value.direction);
        }
    }

    drawDirectionText(ctx: CanvasRenderingContext2D, center: Point, direction: HexDirection) {
        ctx.fillText(HexDirection[direction], center.x, center.y, );
    }

    drawHex(ctx: CanvasRenderingContext2D, center: Point, color?: string, strokeWidth?: number) {
        for (let i = 0; i <= 5; i++) {
            let start = this.getHexCornerCoord(center, i);
            let end = this.getHexCornerCoord(center, i + 1);
            this.drawLine(ctx, start, end, color, strokeWidth);
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

    getHexCornerCoord(center: Point, i: number): Point {
        let angle_deg = 60 * i + 30;
        let angle_rad = Math.PI / 180 * angle_deg
        let x = center.x + this.padHexSize * Math.cos(angle_rad);
        let y = center.y + this.padHexSize * Math.sin(angle_rad);
        return {
            x: x,
            y: y
        }
    }

    hexToPixel(hex: Hex): Point {
        let x = this.padHexSize * Math.sqrt(3) * (hex.q + hex.r / 2) + (this.center.x || 0);
        let y = this.padHexSize * 3 / 2 * hex.r + (this.center.y || 0);
        return { x: x, y: y }
    }

    pixelToPointyHex(point: Point) {
        let offset = this.center;
        let size = this.padHexSize;
        let q = ((point.x - offset.x) * Math.sqrt(3)/3 - (point.y - offset.y) / 3) / size;
        let r = (point.y - offset.y) * 2/3 / size;
        return new Hex(q, r);
    }

    handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        let ctx = this.padRef.current?.getContext("2d");
        if(ctx == null) return;
        let pointOnCanvas = {
            x: e.pageX - this.canvasBounds.left,
            y: e.pageY - this.canvasBounds.top
        }
        let floatHex = this.pixelToPointyHex(pointOnCanvas);
        let cube = cubeRound(floatHex);
        let roundHex = new Hex(cube.q, cube.r);
        
        // on hex change
        if(checkSameHex(this.currentHex, roundHex) == false)
        {
            this.preHex = this.currentHex;
            this.currentHex = roundHex;
            this.oHexChange.notify([this.preHex, this.currentHex]);
        }
    }

    handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        let ctx = this.padRef.current?.getContext("2d");
        if(ctx == null) return;
        let pointOnCanvas = {
            x: e.pageX - this.canvasBounds.left,
            y: e.pageY - this.canvasBounds.top
        }
        let floatHex = this.pixelToPointyHex(pointOnCanvas);
        let cube = cubeRound(floatHex);
        let roundHex = new Hex(cube.q, cube.r);
        this.oHexClick.notify([roundHex, e.nativeEvent.button]);
    }

    handleMouseOut(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        let ctx = this.outRef.current?.getContext("2d");
        if(ctx == null) return;
        ctx.clearRect(0, 0, this.props.width, this.props.height);
    }

    render() {
        return(
            <>
                <canvas ref={this.padRef} className="pad" height={this.props.height} width={this.props.width} style={{left: this.props.left, top: this.props.top}}/>
                <canvas ref={this.outRef} className="padOut" height={this.props.height} width={this.props.width} style={{left: this.props.left, top: this.props.top}}
                onMouseMove={this.handleMouseMove}
                onMouseDown={this.handleMouseDown}
                onMouseOut={this.handleMouseOut}/>
            </>
        )
    }
}

export default HexPad;