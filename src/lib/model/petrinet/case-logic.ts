export class CaseLogic {
    private _create?: boolean;
    private _delete?: boolean;
    private _view?: boolean;

    get create(): boolean | undefined {
        return this._create;
    }

    set create(value: boolean | undefined) {
        this._create = value;
    }

    get delete(): boolean | undefined {
        return this._delete;
    }

    set delete(value: boolean | undefined) {
        this._delete = value;
    }

    get view(): boolean | undefined {
        return this._view;
    }

    set view(value: boolean | undefined) {
        this._view = value;
    }

    clone(): CaseLogic {
        const cloned = new CaseLogic();
        cloned.create = this.create;
        cloned.delete = this.delete;
        cloned.view = this.view;
        return cloned;
    }
}
