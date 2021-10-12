import {I18nString} from '../i18n/i18n-string';
import {Event} from '../petrinet/event';
import {TransitionEventType} from './transition-event-type.enum';

export class TransitionEvent extends Event<TransitionEventType> {
    private _title: I18nString;
    private _message: I18nString;

    constructor(type: TransitionEventType) {
        super(type);
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

    public clone(): TransitionEvent {
        const event = new TransitionEvent(this.type);
        event.id = this.id;
        event._message = this._message;
        event._title = this._title;
        this.preActions.forEach(item => event.preActions.push(item.clone()));
        this.postActions.forEach(item => event.postActions.push(item.clone()));
        return event;
    }
}
