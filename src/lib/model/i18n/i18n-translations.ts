import {I18nString} from './i18n-string';

export class I18nTranslations {
    private _locale: string;
    private _i18ns: Map<string, I18nString>;

    constructor(locale: string) {
        this._locale = locale;
        this._i18ns = new Map<string, I18nString>();
    }

    get locale(): string {
        return this._locale;
    }

    set locale(value: string) {
        this._locale = value;
    }

    getI18ns(): Array<I18nString> {
        return Array.from(this._i18ns.values());
    }

    getI18n(name: string): I18nString | undefined {
        return this._i18ns.get(name);
    }

    addI18n(value: I18nString) {
        if (!value || !value.name) return;
        if (this._i18ns.has(value.name)) {
            throw new Error(`Duplicate translation with name ${value.name}`);
        }
        this._i18ns.set(value.name, value);
    }

    removeI18n(name: string) {
        this._i18ns.delete(name);
    }

    public clone(): I18nTranslations {
        const cloned = new I18nTranslations(this._locale);
        this._i18ns.forEach(i => cloned.addI18n(i.clone()));
        return cloned;
    }
}
