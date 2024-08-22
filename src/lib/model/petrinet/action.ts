import {ActionType} from './action-type.enum';
import {Element} from './element';

export class Action extends Element {
    private _definition: string;
    private _actionType: ActionType = ActionType.VALUE;

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

    get actionType(): ActionType {
        return this._actionType;
    }

    set actionType(value: ActionType) {
        this._actionType = value;
    }

    public clone(): Action {
        const cloned = new Action(this.id, this._definition);
        cloned.actionType = this._actionType;
        return cloned;
    }
}
