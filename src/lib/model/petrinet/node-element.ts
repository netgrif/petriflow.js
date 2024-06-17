import {I18nString} from '../i18n/i18n-string';
import {Element} from './element';

export abstract class NodeElement extends Element {
    private _x: number;
    private _y: number;
    private _title: I18nString;

    protected constructor(id: string, x: number, y: number, label: I18nString) {
        super(id);
        this._x = x;
        this._y = y;
        this._title = label;
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

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }
}
