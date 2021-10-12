export class Action {
    private _id: string;
    private _definition: string;

    constructor(id: string, definition: string) {
        this._id = id;
        this._definition = definition;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get definition(): string {
        return this._definition;
    }

    set definition(value: string) {
        this._definition = value;
    }

    public clone(): Action {
        return new Action(this._id, this._definition);
    }
}
