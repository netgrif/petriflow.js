export class Logic {
    private _perform?: boolean;
    private _reassign?: boolean;
    private _cancel?: boolean;
    private _assign?: boolean;
    private _view?: boolean;
    private _viewDisabled?: boolean;

    get perform(): boolean | undefined {
        return this._perform;
    }

    set perform(value: boolean | undefined) {
        this._perform = value;
    }

    get reassign(): boolean | undefined {
        return this._reassign;
    }

    set reassign(value: boolean | undefined) {
        this._reassign = value;
    }

    get cancel(): boolean | undefined {
        return this._cancel;
    }

    set cancel(value: boolean | undefined) {
        this._cancel = value;
    }

    get assign(): boolean | undefined {
        return this._assign;
    }

    set assign(value: boolean | undefined) {
        this._assign = value;
    }

    get view(): boolean | undefined {
        return this._view;
    }

    set view(value: boolean | undefined) {
        this._view = value;
    }

    get viewDisabled(): boolean | undefined {
        return this._viewDisabled;
    }

    set viewDisabled(value: boolean | undefined) {
        this._viewDisabled = value;
    }

    public clone(): Logic {
        const cloned = new Logic();
        cloned.perform = this._perform;
        cloned.reassign = this._reassign;
        cloned.cancel = this._cancel;
        cloned.assign = this._assign;
        cloned.view = this._view;
        return cloned;
    }
}
