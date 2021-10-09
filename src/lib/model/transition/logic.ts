export class Logic {
    private _perform?: boolean;
    private _delegate?: boolean;
    private _cancel?: boolean;
    private _assigned?: boolean;
    private _view?: boolean;

    get perform(): boolean {
        return this._perform;
    }

    set perform(value: boolean) {
        this._perform = value;
    }

    get delegate(): boolean {
        return this._delegate;
    }

    set delegate(value: boolean) {
        this._delegate = value;
    }

    get cancel(): boolean {
        return this._cancel;
    }

    set cancel(value: boolean) {
        this._cancel = value;
    }

    get assigned(): boolean {
        return this._assigned;
    }

    set assigned(value: boolean) {
        this._assigned = value;
    }

    get view(): boolean {
        return this._view;
    }

    set view(value: boolean) {
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
