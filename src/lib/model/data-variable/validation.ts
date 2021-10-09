import {I18nString} from '../i18n/i18n-string';
import {Expression} from './expression';

export class Validation {
    private _expression: Expression;
    private _message?: I18nString;

    constructor() {
        this._message = new I18nString('');
    }

    get expression(): Expression {
        return this._expression;
    }

    set expression(value: Expression) {
        this._expression = value;
    }

    get message(): I18nString {
        return this._message;
    }

    set message(value: I18nString) {
        this._message = value;
    }

    public clone(): Validation {
        const cloned = new Validation();
        cloned.expression = this._expression;
        cloned.message = this._message;
        return cloned;
    }
}
