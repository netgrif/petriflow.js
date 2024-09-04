
export abstract class Element {
    private _id: string;
    private _properties: Map<string, string>;

    protected constructor(id: string) {
        this._id = id;
        this._properties = new Map<string, string>();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get properties(): Map<string, string> {
        return this._properties;
    }

    set properties(value: Map<string, string>) {
        this._properties = value;
    }

    public compare(other: Element): number {
        return this.id.localeCompare(other.id);
    }
}
