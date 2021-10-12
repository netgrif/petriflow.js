import {DataRefBehavior} from './data-ref-behavior.enum';

export class DataRefLogic {
    private _behavior: DataRefBehavior;
    private _required: boolean;
    private _actionRefs: Array<string>;

    constructor() {
        this._behavior = DataRefBehavior.EDITABLE;
        this._required = false;
        this._actionRefs = [];
    }

    get behavior(): DataRefBehavior {
        return this._behavior;
    }

    set behavior(value: DataRefBehavior) {
        this._behavior = value;
    }

    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = value;
    }

    get actionRefs(): Array<string> {
        return this._actionRefs;
    }

    set actionRefs(value: Array<string>) {
        this._actionRefs = value;
    }

    public clone(): DataRefLogic {
        const cloned = new DataRefLogic();
        cloned.behavior = this.behavior;
        cloned.required = this.required;
        this.actionRefs.forEach(b => cloned.actionRefs.push(b));
        return cloned;
    }
}
