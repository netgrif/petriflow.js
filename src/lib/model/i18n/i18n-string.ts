export class I18nString {
    private _id?: string;
    private _value: string;

    constructor(translation: string, name?: string) {
        this._value = translation;
        this._id = name;
    }

    get id(): string | undefined {
        return this._id;
    }

    set id(value: string | undefined) {
        this._id = value;
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
    }

    public clone(): I18nString {
        const cloned = new I18nString(this.value);
        cloned.id = this.id;
        return cloned;
    }

    public isEmpty(): boolean {
        return !this._id && !this._value;
    }
}
