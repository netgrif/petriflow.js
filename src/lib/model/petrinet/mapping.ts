import {DataRef} from '../transition/data-ref';
import {DataGroup} from '../transition/datagroup';
import {RoleRef} from '../transition/role-ref';
import {Trigger} from '../transition/trigger';

export class Mapping {
    private _id: string;
    private _transitionRef: string;
    private _roleRef: Array<RoleRef>;
    private _dataRef: Array<DataRef>;
    private _dataGroup: Array<DataGroup>;
    private _trigger: Array<Trigger>;

    constructor(id: string, transRef: string) {
        this._id = id;
        this._transitionRef = transRef;
        this._roleRef = [];
        this._dataRef = [];
        this._dataGroup = [];
        this._trigger = [];
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get transitionRef(): string {
        return this._transitionRef;
    }

    set transitionRef(value: string) {
        this._transitionRef = value;
    }

    get roleRef(): Array<RoleRef> {
        return this._roleRef;
    }

    set roleRef(value: Array<RoleRef>) {
        this._roleRef = value;
    }

    get dataRef(): Array<DataRef> {
        return this._dataRef;
    }

    set dataRef(value: Array<DataRef>) {
        this._dataRef = value;
    }

    get dataGroup(): Array<DataGroup> {
        return this._dataGroup;
    }

    set dataGroup(value: Array<DataGroup>) {
        this._dataGroup = value;
    }

    get trigger(): Array<Trigger> {
        return this._trigger;
    }

    set trigger(value: Array<Trigger>) {
        this._trigger = value;
    }

    public clone(): Mapping {
        const mapping = new Mapping(this._id, this._transitionRef);
        mapping._roleRef = this._roleRef.map(item => item.clone());
        mapping._dataRef = this._dataRef.map(item => item.clone());
        mapping._dataGroup = this._dataGroup.map(item => item.clone());
        mapping._trigger = this._trigger.map(item => item.clone());
        return mapping;
    }
}
