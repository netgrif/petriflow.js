import {I18nString} from '../i18n/i18n-string';
import {NodeElement} from '../petrinet/node-element';
import {AssignPolicy} from './assign-policy.enum';
import {DataGroup} from './datagroup'; // cspell:disable-line
import {FinishPolicy} from './finish-policy.enum';
import {RoleRef} from './role-ref';
import {TransitionEventSource} from './transition-event-source';
import {TransitionLayout} from './transition-layout';
import {Trigger} from './trigger';

export class Transition extends NodeElement {
    private _layout?: TransitionLayout;
    private _icon?: string;
    private _assignPolicy: AssignPolicy;
    private _finishPolicy: FinishPolicy;
    private _triggers: Array<Trigger>;
    private _roleRefs: Array<RoleRef>;
    // todo refactor from dataGroup to form
    private _dataGroups: Array<DataGroup>;
    private _eventSource: TransitionEventSource;

    constructor(x: number, y: number, id: string) {
        super(id, x, y, new I18nString(''));
        this._assignPolicy = AssignPolicy.MANUAL;
        this._finishPolicy = FinishPolicy.MANUAL;
        this._triggers = [];
        this._roleRefs = [];
        this._dataGroups = [];
        this._eventSource = new TransitionEventSource();
    }

    get layout(): TransitionLayout | undefined {
        return this._layout;
    }

    set layout(value: TransitionLayout | undefined) {
        this._layout = value;
    }

    get icon(): string | undefined {
        return this._icon;
    }

    set icon(value: string | undefined) {
        this._icon = value;
    }

    get assignPolicy(): AssignPolicy {
        return this._assignPolicy;
    }

    set assignPolicy(value: AssignPolicy) {
        this._assignPolicy = value;
    }

    get finishPolicy(): FinishPolicy {
        return this._finishPolicy;
    }

    set finishPolicy(value: FinishPolicy) {
        this._finishPolicy = value;
    }

    get triggers(): Array<Trigger> {
        return this._triggers;
    }

    set triggers(value: Array<Trigger>) {
        this._triggers = value;
    }

    get roleRefs(): Array<RoleRef> {
        return this._roleRefs;
    }

    set roleRefs(value: Array<RoleRef>) {
        this._roleRefs = value;
    }

    get dataGroups(): Array<DataGroup> {
        return this._dataGroups;
    }

    set dataGroups(value: Array<DataGroup>) {
        this._dataGroups = value;
    }

    get eventSource(): TransitionEventSource {
        return this._eventSource;
    }

    set eventSource(value: TransitionEventSource) {
        this._eventSource = value;
    }

    public clone(): Transition {
        const cloned = new Transition(this.x, this.y, this.id);
        cloned.title = this.title?.clone();
        cloned._layout = this._layout?.clone();
        cloned._icon = this._icon;
        cloned._assignPolicy = this._assignPolicy;
        cloned._finishPolicy = this._finishPolicy;
        cloned._triggers = this._triggers.map(item => item.clone());
        cloned._roleRefs = this._roleRefs.map(item => item.clone());
        cloned._dataGroups = this._dataGroups.map(item => item.clone());
        cloned.properties = this.properties?.map(p => p.clone());
        this.eventSource.getEvents().forEach(event => cloned.eventSource.addEvent(event.clone()));
        return cloned;
    }
}
