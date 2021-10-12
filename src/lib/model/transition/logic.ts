export class Logic {
    private _perform?: boolean;
    private _delegate?: boolean;
    private _cancel?: boolean;
    private _assigned?: boolean;
    private _view?: boolean;

    get perform(): boolean | undefined {
        return this._perform;
    }

    set perform(value: boolean | undefined) {
        this._perform = value;
    }

    get delegate(): boolean | undefined {
        return this._delegate;
    }

    set delegate(value: boolean | undefined) {
        this._delegate = value;
    }

    get cancel(): boolean | undefined {
        return this._cancel;
    }

    set cancel(value: boolean | undefined) {
        this._cancel = value;
    }

    get assigned(): boolean | undefined {
        return this._assigned;
    }

    set assigned(value: boolean | undefined) {
        this._assigned = value;
    }

    get view(): boolean | undefined {
        return this._view;
    }

    set view(value: boolean | undefined) {
        this._view = value;
    }

    public clone(): Logic {
        const cloned = new Logic();
        cloned.delegate = this._delegate;
        cloned.cancel = this._cancel;
        cloned.view = this._view;
        cloned.cancel = this._cancel;
        cloned.assigned = this._assigned;
        return cloned;
    }
}
