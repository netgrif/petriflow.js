import {Property} from '../data-variable/property';
import {Logic} from './logic';

export class RoleRef {
    private _id: string;
    private _logic: Logic;
    private _properties?: Array<Property>;

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

    get properties(): Array<Property> | undefined {
        return this._properties;
    }

    set properties(value: Array<Property> | undefined) {
        this._properties = value;
    }

    public clone(): RoleRef {
        const cloned = new RoleRef(this._id);
        cloned._logic = this._logic?.clone();
        cloned._properties = this._properties?.map(p => p.clone());
        return cloned;
    }
}
