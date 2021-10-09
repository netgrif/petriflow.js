import {CaseLogic} from './case-logic';

export class ProcessUserRef {
    private _id: string;
    private _caseLogic: CaseLogic;

    constructor(id: string) {
        this._id = id;
        this._caseLogic = new CaseLogic();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get caseLogic(): CaseLogic {
        return this._caseLogic;
    }

    set caseLogic(value: CaseLogic) {
        this._caseLogic = value;
    }

    public clone(): ProcessUserRef {
        const userref = new ProcessUserRef(this._id);
        userref._caseLogic = this._caseLogic.clone();
        return userref;
    }
}
