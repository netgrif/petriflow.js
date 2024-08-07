import {Property} from './property';

export class Component {
    private _id: string;
    private _properties: Array<Property>;

    constructor(id: string) {
        this._id = id;
        this._properties = new Array<Property>();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get properties(): Array<Property> {
        return this._properties;
    }

    set properties(value: Array<Property>) {
        this._properties = value;
    }

    public clone(): Component {
        const cloned = new Component(this._id);
        cloned.properties = this.properties.map(p => p.clone());
        return cloned;
    }
}
