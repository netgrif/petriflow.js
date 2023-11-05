import {I18nString} from '../i18n/i18n-string';
import {Element} from './element';

export class Transaction extends Element {
    private _title: I18nString;

    constructor(id: string, title: I18nString) {
        super(id);
        this._title = title;
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    public clone(): Transaction {
        return new Transaction(this.id, this._title?.clone());
    }
}
