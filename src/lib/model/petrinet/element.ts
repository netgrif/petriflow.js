import {Property} from '../data-variable/property';

export abstract class Element {
    private _id: string;
    private _properties?: Array<Property>;

    protected constructor(id: string) {
        this._id = id;
        this._properties = []
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get properties(): Array<Property> | undefined{
        return this._properties;
    }

    set properties(value: Array<Property> | undefined) {
        this._properties = value;
    }
}
