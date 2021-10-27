import {Alignment} from './alignment.enum';

export abstract class Layout {
    private _rows?: number;
    private _cols?: number;
    private _offset?: number;
    private _alignment?: Alignment;

    get rows(): number | undefined {
        return this._rows;
    }

    set rows(value: number | undefined) {
        this._rows = value;
    }

    get cols(): number | undefined {
        return this._cols;
    }

    set cols(value: number | undefined) {
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
