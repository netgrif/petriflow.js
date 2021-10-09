export class CaseLogic {
    private _create?: boolean;
    private _delete?: boolean;
    private _view?: boolean;

    get create(): boolean {
        return this._create;
    }

    set create(value: boolean) {
        this._create = value;
    }

    get delete(): boolean {
        return this._delete;
    }

    set delete(value: boolean) {
        this._delete = value;
    }

    get view(): boolean {
        return this._view;
    }

    set view(value: boolean) {
        this._view = value;
    }

    clone(): CaseLogic {
        const cloned = new CaseLogic();
        cloned.view = this.view;
        cloned.delete = this.delete;
        cloned.create = this.create;
        return cloned;
    }
}
