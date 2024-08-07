import {GridItemAlignSelf} from './enums/grid-item-align-self.enum';
import {JustifySelf} from './enums/justify-self.enum';

export class GridItemProperties {

    private _gridColumnStart?: string;
    private _gridColumnEnd?: string;
    private _gridRowStart?: string;
    private _gridRowEnd?: string;
    private _gridColumn?: string;
    private _gridRow?: string;
    private _gridArea?: string;
    private _justifySelf: JustifySelf = JustifySelf.STRETCH;
    private _alignSelf: GridItemAlignSelf = GridItemAlignSelf.STRETCH;
    private _placeSelf = 'auto';


    get gridColumnStart(): string | undefined {
        return this._gridColumnStart;
    }

    set gridColumnStart(value: string | undefined) {
        this._gridColumnStart = value;
    }

    get gridColumnEnd(): string | undefined {
        return this._gridColumnEnd;
    }

    set gridColumnEnd(value: string | undefined) {
        this._gridColumnEnd = value;
    }

    get gridRowStart(): string | undefined {
        return this._gridRowStart;
    }

    set gridRowStart(value: string | undefined) {
        this._gridRowStart = value;
    }

    get gridRowEnd(): string | undefined {
        return this._gridRowEnd;
    }

    set gridRowEnd(value: string | undefined) {
        this._gridRowEnd = value;
    }

    get gridColumn(): string | undefined {
        return this._gridColumn;
    }

    set gridColumn(value: string | undefined) {
        this._gridColumn = value;
    }

    get gridRow(): string | undefined {
        return this._gridRow;
    }

    set gridRow(value: string | undefined) {
        this._gridRow = value;
    }

    get gridArea(): string | undefined {
        return this._gridArea;
    }

    set gridArea(value: string | undefined) {
        this._gridArea = value;
    }

    get justifySelf(): JustifySelf {
        return this._justifySelf;
    }

    set justifySelf(value: JustifySelf) {
        this._justifySelf = value;
    }

    get alignSelf(): GridItemAlignSelf {
        return this._alignSelf;
    }

    set alignSelf(value: GridItemAlignSelf) {
        this._alignSelf = value;
    }

    get placeSelf(): string {
        return this._placeSelf;
    }

    set placeSelf(value: string) {
        this._placeSelf = value;
    }

    public clone() {
        const cloned = new GridItemProperties();
        cloned.gridColumnStart = this._gridColumnStart;
        cloned.gridColumnEnd = this._gridColumnEnd;
        cloned.gridRowStart = this._gridRowStart;
        cloned.gridRowEnd = this._gridRowEnd;
        cloned.gridColumn = this._gridColumn;
        cloned.gridRow = this._gridRow;
        cloned.gridArea = this._gridArea;
        cloned.justifySelf = this._justifySelf;
        cloned.alignSelf = this._alignSelf;
        cloned.placeSelf = this._placeSelf;
        return cloned;
    }
}
