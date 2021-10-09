import {Alignment} from './alignment.enum';

export abstract class Layout {
    private _rows: number;
    private _cols: number;
    private _offset: number;
    private _alignment?: Alignment;

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

    get offset(): number {
        return this._offset;
    }

    set offset(value: number) {
        this._offset = value;
    }

    get alignment(): Alignment {
        return this._alignment;
    }

    set alignment(value: Alignment) {
        this._alignment = value;
    }
}
