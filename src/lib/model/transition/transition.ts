import {I18nString} from '../i18n/i18n-string';
import {AssignPolicy} from './assign-policy.enum';
import {AssignedUser} from './assigned-user';
import {DataFocusPolicy} from './data-focus-policy.enum';
import {DataGroup} from './datagroup';
import {FinishPolicy} from './finish-policy.enum';
import {RoleRef} from './role-ref';
import {TransitionEvent} from './transition-event';
import {TransitionEventType} from './transition-event-type.enum';
import {TransitionLayout} from './transition-layout';
import {Trigger} from './trigger';
import {UserRef} from './user-ref';

export class Transition {
    private _id: string;
    private _x: number;
    private _y: number;
    private _label: I18nString;
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
    private _events: Map<TransitionEventType, TransitionEvent>;
    private _assignedUser?: AssignedUser;

    constructor(x: number, y: number, id: string) {
        this._id = id;
        this._x = x;
        this._y = y;
        this._label = new I18nString('');
        this._assignPolicy = AssignPolicy.MANUAL;
        this._dataFocusPolicy = DataFocusPolicy.MANUAL;
        this._finishPolicy = FinishPolicy.MANUAL;
        this._triggers = [];
        this._roleRefs = [];
        this._userRefs = [];
        this._dataGroups = [];
        this._events = new Map();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get label(): I18nString {
        return this._label;
    }

    set label(value: I18nString) {
        this._label = value;
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

    getEvents(): Array<TransitionEvent> {
        return Array.from(this._events.values());
    }

    getEvent(type: TransitionEventType): TransitionEvent | undefined {
        return this._events.get(type);
    }

    addEvent(event: TransitionEvent) {
        if (this._events.has(event.type)) {
            throw new Error(`Duplicate event of type ${event.type}`);
        }
        this._events.set(event.type, event);
    }

    removeEvent(type: TransitionEventType) {
        this._events.delete(type);
    }

    get assignedUser(): AssignedUser | undefined {
        return this._assignedUser;
    }

    set assignedUser(value: AssignedUser | undefined) {
        this._assignedUser = value;
    }

    public mergeEvent(event: TransitionEvent) {
        if (this._events.has(event.type)) {
            const oldEvent = this._events.get(event.type);
            if (!oldEvent) return;
            oldEvent.preActions.push(...event.preActions);
            oldEvent.postActions.push(...event.postActions);
        } else {
            this._events.set(event.type, event);
        }
    }

    public clone(): Transition {
        const trans = new Transition(this._x, this._y, this._id);
        trans._label = this._label?.clone();
        trans._layout = this._layout?.clone();
        trans._icon = this._icon;
        trans._priority = this._priority;
        trans._assignPolicy = this._assignPolicy;
        trans._dataFocusPolicy = this._dataFocusPolicy;
        trans._finishPolicy = this._finishPolicy;
        trans._triggers = this._triggers.map(item => item.clone());
        trans._transactionRef = this._transactionRef;
        trans._roleRefs = this._roleRefs.map(item => item.clone());
        trans._userRefs = this._userRefs.map(item => item.clone());
        trans._dataGroups = this._dataGroups.map(item => item.clone());
        this._events.forEach((event, type) => {
            trans._events.set(type, event);
        });
        trans._assignedUser = this._assignedUser;
        return trans;
    }
}
