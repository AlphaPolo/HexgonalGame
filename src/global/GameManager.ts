import { OnCurrentHexChange, OnHexClick } from "../pages/Hex";
import HexPad from "../pages/HexPad";
import MyCanvas from "../pages/MyCanvas";

export class GameManager {
    private static instance: GameManager;
    private _board?: MyCanvas;
    private _pad?: HexPad;


    public getBoard(): MyCanvas | null | undefined {
        return this._board;
    }

    public setBoard(value: MyCanvas) {
        this._board = value;
    }

    public getPad(): HexPad | null | undefined {
        return this._pad;
    }

    public setPad(value: HexPad) {
        this._pad = value;
    }
    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() { }

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }

        return GameManager.instance;
    }

    public attachOnHexChange(onHexChange: OnCurrentHexChange) {
        this._board?.oHexChange.attach(onHexChange);
    }

    public detachOnHexChange(onHexChange: OnCurrentHexChange) {
        this._board?.oHexChange.detach(onHexChange);
    }

    public attachOnHexClick(onHexClick: OnHexClick) {
        this._board?.oHexClick.attach(onHexClick);
    }

    public detachOnHexClick(onHexClick: OnHexClick) {
        this._board?.oHexClick.detach(onHexClick);
    }

    public attachOnDirectionClick(onDirectionClick: OnHexClick) {
        this._pad?.oHexClick.attach(onDirectionClick);
    }

    public detachOnDirectionClick(onHexClick: OnHexClick) {
        this._pad?.oHexClick.detach(onHexClick);
    }

    public getAllUnitOnBoard() {
        return this._board?.gameObjects?? [];
    }
}