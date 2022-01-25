import {I18nString} from '../i18n/i18n-string';
import {EventSource} from '../petrinet/event-source';
import {RoleEvent} from './role-event';
import {RoleEventType} from './role-event-type.enum';

export class Role extends EventSource<RoleEvent, RoleEventType> {
    private _id: string;
    private _title: I18nString;

    constructor(id: string) {
        super();
        this._id = id;
        this._title = new I18nString('');
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

    public clone(): Role {
        const cloned = new Role(this._id);
        cloned._title = this._title?.clone();
        this.getEvents().forEach(event => cloned.addEvent(event.clone()));
        return cloned;
    }
}
