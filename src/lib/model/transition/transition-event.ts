import {I18nString} from '../i18n/i18n-string';
import {Event} from '../petrinet/event';
import {TransitionEventType} from './transition-event-type.enum';

export class TransitionEvent extends Event<TransitionEventType> {
    private _title: I18nString;

    constructor(type: TransitionEventType, id: string) {
        super(type, id);
        this._title = new I18nString('');
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    public clone(): TransitionEvent {
        const cloned = new TransitionEvent(this.type, this.id);
        cloned.message = this.message?.clone();
        cloned._title = this._title?.clone();
        this.preActions.forEach(item => cloned.preActions.push(item.clone()));
        this.postActions.forEach(item => cloned.postActions.push(item.clone()));
        this.properties.forEach((value, key) => cloned.properties.set(key, value));
        return cloned;
    }

    public isEmpty(): boolean {
        return super.isEmpty() && this._title.isEmpty();
    }
}
