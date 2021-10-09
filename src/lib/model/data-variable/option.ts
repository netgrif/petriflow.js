import {I18nString} from '../i18n/i18n-string';

export class Option {
    private _key: string;
    private _value: I18nString;

    constructor(key = '', value = new I18nString('')) {
        this._key = key;
        this._value = value;
    }

    get key(): string {
        return this._key;
    }

    set key(value: string) {
        this._key = value;
    }

    get value(): I18nString {
        return this._value;
    }

    set value(value: I18nString) {
        this._value = value;
    }

    static of(key: string, value: I18nString): Option {
        const option = new Option();
        option._key = key;
        option._value = value;
        return option;
    }

    public clone(): Option {
        const opt = new Option();
        opt._key = this._key;
        opt._value = this._value?.clone();
        return opt;
    }
}
