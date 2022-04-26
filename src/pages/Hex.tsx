export type CanvasSizeState = {
    canvasWidth: number;
    canvasHeight: number;
};

export type Point = {
    x: number;
    y: number;
};

export type Cube = {
    q: number;
    r: number;
    s: number;
};

export type Rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

export enum HexDirection {
    NE, E, SE, SW, W, NW
}

export class Hex {
    q: number;
    r: number;
    s: number;
    constructor(q: number, r: number, s: number = -q - r) {
        this.q = q;
        this.r = r;
        this.s = s;
    }
}

export const CubeDirection: Readonly<Readonly<Hex>[]> = [
    new Hex(1, -1), new Hex(1, 0), new Hex(0, 1),
    new Hex(-1, 1), new Hex(-1, 0), new Hex(0, -1)
];

export const getNeighbors = (hex: Hex) => {
    return CubeDirection.map(direction => cubeAdd(hex, direction));
}

export const getCubeNeighbor = (hex: Hex, direction: HexDirection) => {
    return cubeAdd(hex, CubeDirection[direction]);
};

export const cubeAdd = (leftHex: Hex, rightHex: Hex): Hex => {
    return new Hex(leftHex.q + rightHex.q, leftHex.r + rightHex.r);
};

export const cubeSubstract = (leftHex: Hex, rightHex: Hex): Hex => {
    return new Hex(leftHex.q - rightHex.q, leftHex.r - rightHex.r);
};

export const checkSameHex = (leftHex?: Hex, rightHex?: Hex) => {
    if (leftHex?.q !== rightHex?.q)
        return false;
    if (leftHex?.r !== rightHex?.r)
        return false;
    if (leftHex?.s !== rightHex?.s)
        return false;
    return true;
};

export const hexToPoint = (hex: Hex) => {
    let x = 30 * Math.sqrt(3) * (hex.q + hex.r / 2);
    let y = 30 * 3 / 2 * hex.r;
    return {x: x, y: y}
}

export type OnCurrentHexChange = (preHex?: Hex, currentHex?: Hex) => void;

export type OnHexClick = (hex: Hex, mouse: number) => void;
