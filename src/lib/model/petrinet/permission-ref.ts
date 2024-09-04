export abstract class PermissionRef<T> {
    private _id: string;
    private _logic: T;
    private _properties: Map<string, string>;

    protected constructor(id: string, logic: T) {
        this._id = id;
        this._logic = logic;
        this._properties = new Map<string, string>();
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

    get properties(): Map<string, string> {
        return this._properties;
    }

    set properties(value: Map<string, string>) {
        this._properties = value;
    }

    public compare(ref: PermissionRef<T>): number {
        return this.id.localeCompare(ref.id);
    }
}
