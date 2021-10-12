import {PetriNet} from '../model';

export class PetriNetResult {
    private _model: PetriNet;
    private _errors: Array<string>;
    private _warnings: Array<string>;
    private _info: Array<string>;
    private _fileName?: string;

    constructor(model: PetriNet = new PetriNet()) {
        this._model = model;
        this._errors = [];
        this._warnings = [];
        this._info = [];
    }

    get model(): PetriNet {
        return this._model;
    }

    set model(value: PetriNet) {
        this._model = value;
    }

    get errors(): Array<string> {
        return this._errors;
    }

    addError(error: string, e: Error) {
        this._errors.push(error);
        console.log(e);
    }

    get warnings(): Array<string> {
        return this._warnings;
    }

    addWarning(warning: string) {
        this._warnings.push(warning);
    }

    get info(): Array<string> {
        return this._info;
    }

    addInfo(value: string) {
        this._info.push(value);
    }

    get fileName(): string | undefined {
        return this._fileName;
    }

    set fileName(value: string | undefined) {
        this._fileName = value;
    }
}
