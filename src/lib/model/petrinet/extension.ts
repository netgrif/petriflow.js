export class Extension {

    private _id: string;
    private _version: string;

    constructor(id: string, version: string) {
        this._id = id;
        this._version = version;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get version(): string {
        return this._version;
    }

    set version(value: string) {
        this._version = value;
    }

    public clone(): Extension {
        return new Extension(this._id, this._version);
    }
}
