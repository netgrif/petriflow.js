import {Logic} from './logic';

export class UserRef {
    private _id: string;
    private _logic: Logic;

    constructor(id: string) {
        this._id = id;
        this._logic = new Logic();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get logic(): Logic {
        return this._logic;
    }

    set logic(value: Logic) {
        this._logic = value;
    }

    public clone(): UserRef {
        const cloned = new UserRef(this._id);
        cloned.logic = this._logic.clone();
        return cloned;
    }
}
