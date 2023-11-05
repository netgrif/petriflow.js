export abstract class Element {
    private _id: string;

    protected constructor(id: string) {
        this._id = id;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }
}
