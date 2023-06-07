export class I18nString {
    private _name?: string;
    private _value: string;

    constructor(translation: string, name?: string) {
        this._value = translation;
        this._name = name;
    }

    get name(): string | undefined {
        return this._name;
    }

    set name(value: string | undefined) {
        this._name = value;
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
    }

    public clone(): I18nString {
        const cloned = new I18nString(this.value);
        cloned.name = this.name;
        return cloned;
    }

    public isEmpty(): boolean {
        return !this._name && !this._value;
    }
}
