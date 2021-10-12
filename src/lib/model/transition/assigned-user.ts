export class AssignedUser {
    private _cancel?: boolean;
    private _reassign?: boolean;

    get cancel(): boolean | undefined {
        return this._cancel;
    }

    set cancel(value: boolean | undefined) {
        this._cancel = value;
    }

    get reassign(): boolean | undefined {
        return this._reassign;
    }

    set reassign(value: boolean | undefined) {
        this._reassign = value;
    }

    public clone(): AssignedUser {
        const cloned = new AssignedUser();
        cloned.cancel = this.cancel;
        cloned.reassign = this.reassign;
        return cloned;
    }
}
