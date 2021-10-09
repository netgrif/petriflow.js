import {DataRef} from './data-ref';
import {LayoutType} from './layout-type.enum';
import {I18nString} from '../i18n/i18n-string';
import {Alignment} from './alignment.enum';

export class DataGroup {
    private _id: string;
    private _cols?: number;
    private _rows?: number;
    private _title?: I18nString;
    private _layout: LayoutType;
    private _alignment?: Alignment;
    private _stretch?: boolean;
    private _dataRefs?: Map<string, DataRef>;

    constructor(id) {
        this._id = id;
        this._title = new I18nString('');
        this._stretch = false;
        this._dataRefs = new Map<string, DataRef>();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get cols(): number {
        return this._cols;
    }

    set cols(value: number) {
        this._cols = value;
    }

    get rows(): number {
        return this._rows;
    }

    set rows(value: number) {
        this._rows = value;
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    get layout(): LayoutType {
        return this._layout;
    }

    set layout(value: LayoutType) {
        this._layout = value;
    }

    get alignment(): Alignment {
        return this._alignment;
    }

    set alignment(value: Alignment) {
        this._alignment = value;
    }

    get stretch(): boolean {
        return this._stretch;
    }

    set stretch(value: boolean) {
        this._stretch = value;
    }

    getDataRefs(): Array<DataRef> {
        return Array.from(this._dataRefs.values());
    }

    getDataRef(id: string): DataRef {
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
        const datagroup = new DataGroup(this._id);
        datagroup._title = this._title?.clone();
        datagroup._alignment = this._alignment;
        datagroup._layout = this._layout;
        datagroup._stretch = this._stretch;
        datagroup._rows = this._rows;
        datagroup._cols = this._cols;
        this._dataRefs.forEach(item => {
            datagroup.addDataRef(item.clone());
        });
        return datagroup;
    }
}
