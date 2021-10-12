import {Alignment} from './alignment.enum';

export abstract class Layout {
    private _rows: number;
    private _cols: number;
    private _offset?: number;
    private _alignment?: Alignment;


    constructor(rows = 0, cols = 0) {
        this._rows = rows;
        this._cols = cols;
    }

    get rows(): number {
        return this._rows;
    }

    set rows(value: number) {
        this._rows = value;
    }

    get cols(): number {
        return this._cols;
    }

    set cols(value: number) {
        this._cols = value;
    }

    get offset(): number | undefined {
        return this._offset;
    }

    set offset(value: number | undefined) {
        this._offset = value;
    }

    get alignment(): Alignment | undefined {
        return this._alignment;
    }

    set alignment(value: Alignment | undefined) {
        this._alignment = value;
    }
}
