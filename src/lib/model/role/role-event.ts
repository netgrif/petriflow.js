import {I18nString} from '../i18n/i18n-string';
import {Event} from '../petrinet/event';
import {RoleEventType} from './role-event-type.enum';

export class RoleEvent extends Event<RoleEventType> {
    private _title: I18nString;
    private _message: I18nString;

    constructor(type: RoleEventType, id: string) {
        super(type, id);
        this._title = new I18nString('');
        this._message = new I18nString('');
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    get message(): I18nString {
        return this._message;
    }

    set message(value: I18nString) {
        this._message = value;
    }

    public clone(): RoleEvent {
        const cloned = new RoleEvent(this.type, this.id);
        cloned._title = this._title?.clone();
        cloned._message = this._message?.clone();
        this.preActions.forEach(item => cloned.preActions.push(item.clone()));
        this.postActions.forEach(item => cloned.postActions.push(item.clone()));
        return cloned;
    }
}
