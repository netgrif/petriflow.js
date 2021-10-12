import {I18nString} from '../i18n/i18n-string';
import {RoleEvent} from './role-event';
import {RoleEventType} from './role-event-type.enum';

export class Role {
    private _id: string;
    private _title: I18nString;
    private _events: Map<RoleEventType, RoleEvent>;

    constructor(id: string) {
        this._id = id;
        this._title = new I18nString('');
        this._events = new Map<RoleEventType, RoleEvent>();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    getEvents(): Array<RoleEvent> {
        return Array.from(this._events.values());
    }

    getEvent(type: RoleEventType): RoleEvent | undefined {
        return this._events.get(type);
    }

    addEvent(event: RoleEvent) {
        if (this._events.has(event.type)) {
            throw new Error(`Duplicate event with type ${event.type}`);
        }
        this._events.set(event.type, event);
    }

    removeEvent(type: RoleEventType) {
        this._events.delete(type);
    }

    mergeEvent(event: RoleEvent) {
        if (this._events.has(event.type)) {
            const oldEvent = this._events.get(event.type);
            if (!oldEvent) return;
            oldEvent.preActions.push(...event.preActions);
            oldEvent.postActions.push(...event.postActions);
        } else {
            this._events.set(event.type, event);
        }
    }

    public clone(): Role {
        const role = new Role(this._id);
        role._title = this._title.clone();
        this._events.forEach(e => role.addEvent(e));
        return role;
    }
}
