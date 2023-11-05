import {Element} from './element';

export class Action extends Element {
    private _definition: string;

    constructor(id: string, definition: string) {
        super(id);
        this._definition = definition;
    }

    get definition(): string {
        return this._definition;
    }

    set definition(value: string) {
        this._definition = value;
    }

    public clone(): Action {
        return new Action(this.id, this._definition);
    }
}
