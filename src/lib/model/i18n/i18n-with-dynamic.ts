import {I18nString} from './i18n-string';

export class I18nWithDynamic extends I18nString {
    private _dynamic: boolean;

    constructor(value: string, name?: string, dynamic = false) {
        super(value, name);
        this._dynamic = dynamic;
    }

    get dynamic(): boolean {
        return this._dynamic;
    }

    set dynamic(value: boolean) {
        this._dynamic = value;
    }

    public clone(): I18nWithDynamic {
        return new I18nWithDynamic(this.value, this.id, this._dynamic);
    }
}
