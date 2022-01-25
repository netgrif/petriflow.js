import {I18nString} from '../i18n/i18n-string';

export class Place {
    private _id: string;
    private _static: boolean;
    private _x: number;
    private _y: number;
    private _label: I18nString;
    private _marking: number;

    constructor(x: number, y: number, isStatic: boolean, id: string) {
        this._id = id;
        this._static = isStatic;
        this._x = x;
        this._y = y;
        this._label = new I18nString('');
        this._marking = 0;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get static(): boolean {
        return this._static;
    }

    set static(value: boolean) {
        this._static = value;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get label(): I18nString {
        return this._label;
    }

    set label(value: I18nString) {
        this._label = value;
    }

    get marking(): number {
        return this._marking;
    }

    set marking(value: number) {
        this._marking = value;
    }

    public clone(): Place {
        const cloned = new Place(this._x, this._y, this._static, this._id);
        cloned._label = this._label?.clone();
        cloned._marking = this._marking;
        return cloned;
    }
}
