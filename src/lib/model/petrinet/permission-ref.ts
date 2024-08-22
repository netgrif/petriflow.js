import {Property} from '../data-variable/property';

export abstract class PermissionRef<T> {
    private _id: string;
    private _logic: T;
    private _properties?: Array<Property>;

    protected constructor(id: string, logic: T) {
        this._id = id;
        this._logic = logic;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get logic(): T {
        return this._logic;
    }

    set logic(value: T) {
        this._logic = value;
    }

    get properties(): Array<Property> | undefined {
        return this._properties;
    }

    set properties(value: Array<Property> | undefined) {
        this._properties = value;
    }

    public compare(ref: PermissionRef<T>): number {
        return this.id.localeCompare(ref.id);
    }
}
