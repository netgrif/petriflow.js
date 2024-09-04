export class Component {
    private _id: string;
    private _properties: Map<string, string>;

    constructor(id: string) {
        this._id = id;
        this._properties = new Map<string, string>;
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

    public clone(): Component {
        const cloned = new Component(this._id);
        this.properties.forEach((value, key) => cloned.properties.set(key, value));
        return cloned;
    }
}
