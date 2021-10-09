export class Expression {
    private _dynamic: boolean;
    private _expression: string;

    constructor(expression: string, dynamic = false) {
        this._dynamic = dynamic;
        this._expression = expression;
    }

    get dynamic(): boolean {
        return this._dynamic;
    }

    set dynamic(value: boolean) {
        this._dynamic = value;
    }

    get expression(): string {
        return this._expression;
    }

    set expression(value: string) {
        this._expression = value;
    }

    public clone() {
        return new Expression(this._expression, this._dynamic);
    }
}
