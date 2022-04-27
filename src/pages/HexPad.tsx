import React, { RefObject } from "react";
import { CubeDirection, genNeighbors, getCubeNeighbor, Hex, HexDirection, Point } from "./Hex";

interface HexPadProps {
    left: number;
    top: number;
    width: number;
    height: number;
}

class HexPad extends React.Component<HexPadProps> {

    padRef:RefObject<HTMLCanvasElement> = React.createRef();

    padHexSize = 48;
    center: { x: number; y: number; } = { x: 0, y: 0};

    componentDidMount() {
        let ctx = this.padRef.current?.getContext("2d");
        this.center = {
            x: this.props.width / 2,
            y: this.props.height/ 2
        }
        if(ctx)
        {
            this.drawPad(ctx);
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

    // handleMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    //     let ctx = this.canvasCoordinates.current?.getContext("2d");
    //     if(ctx == null) return;
    //     let pointOnCanvas = {
    //         x: e.pageX - this.canvasBounds.left,
    //         y: e.pageY - this.canvasBounds.top
    //     }
    //     let floatHex = this.pixelToPointyHex(pointOnCanvas);
    //     let cube = this.cubeRound(floatHex);
    //     let roundHex = new Hex(cube.q, cube.r);
        
    //     // on hex change
    //     if(checkSameHex(this.currentHex, roundHex) == false)
    //     {
    //         this.preHex = this.currentHex;
    //         this.currentHex = roundHex;
    //         this.oHexChange.notify([this.preHex, this.currentHex]);
    //     }
    // }

    render() {
        return(
            <canvas ref={this.padRef} className="pad" height={this.props.height} width={this.props.width} style={{left: this.props.left, top: this.props.top}}/>
            
        )
    }
}

export default HexPad;