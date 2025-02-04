import {Property} from '../data-variable/property';

export abstract class Element {
    private _id: string;
    private _properties: Array<Property>;

    protected constructor(id: string, properties: Array<Property> = []) {
        this._id = id;
        this._properties = properties
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get properties(): Array<Property>{
        return this._properties;
    }

    set properties(value: Array<Property>) {
        this._properties = value;
    }

    public compare(other: Element): number {
        return this.id.localeCompare(other.id);
    }
}
