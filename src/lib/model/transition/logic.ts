export class Logic {
    private _perform?: boolean;
    private _delegate?: boolean;
    private _cancel?: boolean;
    private _assign?: boolean;
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

    public clone(): Logic {
        const cloned = new Logic();
        cloned.perform = this._perform;
        cloned.delegate = this._delegate;
        cloned.cancel = this._cancel;
        cloned.assign = this._assign;
        cloned.view = this._view;
        return cloned;
    }
}
