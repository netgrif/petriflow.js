import {DataRef} from '../transition/data-ref';
import {DataGroup} from '../transition/datagroup'; // cspell:disable-line
import {TransitionPermissionRef} from '../transition/transition-permission-ref';
import {Trigger} from '../transition/trigger';
import {Element} from './element';

export class Mapping extends Element {
    private _transitionRef: string;
    private _roleRef: Array<TransitionPermissionRef>;
    private _dataRef: Array<DataRef>;
    private _dataGroup: Array<DataGroup>;
    private _trigger: Array<Trigger>;

    constructor(id: string, transRef: string) {
        super(id);
        this._transitionRef = transRef;
        this._roleRef = [];
        this._dataRef = [];
        this._dataGroup = [];
        this._trigger = [];
    }

    get transitionRef(): string {
        return this._transitionRef;
    }

    set transitionRef(value: string) {
        this._transitionRef = value;
    }

    get roleRef(): Array<TransitionPermissionRef> {
        return this._roleRef;
    }

    set roleRef(value: Array<TransitionPermissionRef>) {
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
        const cloned = new Mapping(this.id, this._transitionRef);
        cloned._roleRef = this._roleRef.map(item => item.clone());
        cloned._dataRef = this._dataRef.map(item => item.clone());
        cloned._dataGroup = this._dataGroup.map(item => item.clone());
        cloned._trigger = this._trigger.map(item => item.clone());
        return cloned;
    }
}
