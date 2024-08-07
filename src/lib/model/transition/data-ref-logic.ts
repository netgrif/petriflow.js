import {DataRefBehavior} from './data-ref-behavior.enum';

export class DataRefLogic {
    private _behavior: DataRefBehavior;
    private _required: boolean;
    private _immediate: boolean;

    constructor() {
        this._behavior = DataRefBehavior.EDITABLE;
        this._required = false;
        this._immediate = false;
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

    get immediate(): boolean {
        return this._immediate;
    }

    set immediate(value: boolean) {
        this._immediate = value;
    }

    public clone(): DataRefLogic {
        const cloned = new DataRefLogic();
        cloned.behavior = this.behavior;
        cloned.required = this.required;
        cloned.immediate = this.immediate;
        return cloned;
    }
}
