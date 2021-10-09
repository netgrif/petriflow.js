import {I18nString} from './i18n-string';

export class I18nWithDynamic extends I18nString {
    private _dynamic: boolean;

    constructor(value: string, dynamic = false) {
        super(value);
        this._dynamic = dynamic;
    }

    get dynamic(): boolean {
        return this._dynamic;
    }

    set dynamic(value: boolean) {
        this._dynamic = value;
    }

    public clone(): I18nWithDynamic {
        const i18n = new I18nWithDynamic(this.value, this._dynamic);
        i18n.name = this.name;
        return i18n;
    }
}
