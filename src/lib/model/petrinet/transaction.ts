import {I18nString} from '../i18n/i18n-string';

export class Transaction {
    private _id: string;
    private _title: I18nString;

    constructor(id: string, title: I18nString) {
        this._id = id;
        this._title = title;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    public clone(): Transaction {
        return new Transaction(this._id, this._title);
    }
}
