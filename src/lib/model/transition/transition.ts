import {I18nString} from '../i18n/i18n-string';
import {NodeElement} from '../petrinet/node-element';
import {AssignPolicy} from './assign-policy.enum';
import {AssignedUser} from './assigned-user';
import {DataFocusPolicy} from './data-focus-policy.enum';
import {DataGroup} from './datagroup'; // cspell:disable-line
import {FinishPolicy} from './finish-policy.enum';
import {RoleRef} from './role-ref';
import {TransitionEventSource} from './transition-event-source';
import {TransitionLayout} from './transition-layout';
import {Trigger} from './trigger';
import {UserRef} from './user-ref';

export class Transition extends NodeElement {
    private _layout?: TransitionLayout;
    private _icon?: string;
    private _priority?: number;
    private _assignPolicy: AssignPolicy;
    private _finishPolicy: FinishPolicy;
    private _dataFocusPolicy: DataFocusPolicy;
    private _triggers: Array<Trigger>;
    private _transactionRef?: string;
    private _roleRefs: Array<RoleRef>;
    private _userRefs: Array<UserRef>;
    private _dataGroups: Array<DataGroup>;
    private _assignedUser?: AssignedUser;
    private _eventSource: TransitionEventSource;

    constructor(x: number, y: number, id: string) {
        super(id, x, y, new I18nString(''));
        this._assignPolicy = AssignPolicy.MANUAL;
        this._dataFocusPolicy = DataFocusPolicy.MANUAL;
        this._finishPolicy = FinishPolicy.MANUAL;
        this._triggers = [];
        this._roleRefs = [];
        this._userRefs = [];
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

    get priority(): number | undefined {
        return this._priority;
    }

    set priority(value: number | undefined) {
        this._priority = value;
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

    get dataFocusPolicy(): DataFocusPolicy {
        return this._dataFocusPolicy;
    }

    set dataFocusPolicy(value: DataFocusPolicy) {
        this._dataFocusPolicy = value;
    }

    get triggers(): Array<Trigger> {
        return this._triggers;
    }

    set triggers(value: Array<Trigger>) {
        this._triggers = value;
    }

    get transactionRef(): string | undefined {
        return this._transactionRef;
    }

    set transactionRef(value: string | undefined) {
        this._transactionRef = value;
    }

    get roleRefs(): Array<RoleRef> {
        return this._roleRefs;
    }

    set roleRefs(value: Array<RoleRef>) {
        this._roleRefs = value;
    }

    get userRefs(): Array<UserRef> {
        return this._userRefs;
    }

    set userRefs(value: Array<UserRef>) {
        this._userRefs = value;
    }

    get dataGroups(): Array<DataGroup> {
        return this._dataGroups;
    }

    set dataGroups(value: Array<DataGroup>) {
        this._dataGroups = value;
    }

    get assignedUser(): AssignedUser | undefined {
        return this._assignedUser;
    }

    set assignedUser(value: AssignedUser | undefined) {
        this._assignedUser = value;
    }

    get eventSource(): TransitionEventSource {
        return this._eventSource;
    }

    set eventSource(value: TransitionEventSource) {
        this._eventSource = value;
    }

    public clone(): Transition {
        const cloned = new Transition(this.x, this.y, this.id);
        cloned.label = this.label?.clone();
        cloned._layout = this._layout?.clone();
        cloned._icon = this._icon;
        cloned._priority = this._priority;
        cloned._assignPolicy = this._assignPolicy;
        cloned._finishPolicy = this._finishPolicy;
        cloned._dataFocusPolicy = this._dataFocusPolicy;
        cloned._triggers = this._triggers.map(item => item.clone());
        cloned._transactionRef = this._transactionRef;
        cloned._roleRefs = this._roleRefs.map(item => item.clone());
        cloned._userRefs = this._userRefs.map(item => item.clone());
        cloned._dataGroups = this._dataGroups.map(item => item.clone());
        cloned._assignedUser = this._assignedUser?.clone();
        this.eventSource.getEvents().forEach(event => cloned.eventSource.addEvent(event.clone()));
        return cloned;
    }
}
