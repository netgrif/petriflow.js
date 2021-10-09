import {Logic} from './logic';

export class RoleRef {
    private _id: string;
    private _logic: Logic;

    constructor(id) {
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

    public clone(): RoleRef {
        const roleref = new RoleRef(this._id);
        roleref._logic = this._logic.clone();
        return roleref;
    }
}
