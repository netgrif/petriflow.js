import {I18nString} from '../i18n/i18n-string';
import {Alignment} from './alignment.enum';
import {CompactDirection} from './compact-direction.enum';
import {DataRef} from './data-ref';
import {HideEmptyRows} from './hide-empty-rows.enum';
import {LayoutType} from './layout-type.enum';

export class DataGroup {
    private _id: string;
    private _cols?: number;
    private _rows?: number;
    private _title?: I18nString;
    private _layout?: LayoutType;
    private _alignment?: Alignment;
    private _stretch: boolean;
    private _hideEmptyRows?: HideEmptyRows;
    private _compactDirection?: CompactDirection;
    private _dataRefs: Map<string, DataRef>;

    constructor(id: string) {
        this._id = id;
        this._stretch = false;
        this._dataRefs = new Map<string, DataRef>();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get cols(): number | undefined {
        return this._cols;
    }

    set cols(value: number | undefined) {
        this._cols = value;
    }

    get rows(): number | undefined {
        return this._rows;
    }

    set rows(value: number | undefined) {
        this._rows = value;
    }

    get title(): I18nString | undefined {
        return this._title;
    }

    set title(value: I18nString | undefined) {
        this._title = value;
    }

    get layout(): LayoutType | undefined {
        return this._layout;
    }

    set layout(value: LayoutType | undefined) {
        this._layout = value;
    }

    get alignment(): Alignment | undefined {
        return this._alignment;
    }

    set alignment(value: Alignment | undefined) {
        this._alignment = value;
    }

    get stretch(): boolean {
        return this._stretch;
    }

    set stretch(value: boolean) {
        this._stretch = value;
    }

    get hideEmptyRows(): HideEmptyRows | undefined {
        return this._hideEmptyRows;
    }

    set hideEmptyRows(value: HideEmptyRows | undefined) {
        this._hideEmptyRows = value;
    }

    get compactDirection(): CompactDirection | undefined {
        return this._compactDirection;
    }

    set compactDirection(value: CompactDirection | undefined) {
        this._compactDirection = value;
    }

    getDataRefs(): Array<DataRef> {
        return Array.from(this._dataRefs.values());
    }

    getDataRef(id: string): DataRef | undefined {
        return this._dataRefs.get(id);
    }

    addDataRef(ref: DataRef) {
        if (this._dataRefs.has(ref.id)) {
            throw new Error(`Duplicate data field with id ${ref.id}`);
        }
        this._dataRefs.set(ref.id, ref);
    }

    removeDataRef(id: string) {
        this._dataRefs.delete(id);
    }

    public clone(): DataGroup {
        const cloned = new DataGroup(this._id);
        cloned._cols = this._cols;
        cloned._rows = this._rows;
        cloned._title = this._title?.clone();
        cloned._layout = this._layout;
        cloned._alignment = this._alignment;
        cloned._stretch = this._stretch;
        cloned._hideEmptyRows = this._hideEmptyRows;
        cloned._compactDirection = this._compactDirection;
        this._dataRefs.forEach(item => {
            cloned.addDataRef(item.clone());
        });
        return cloned;
    }
}
