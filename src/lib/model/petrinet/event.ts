import {I18nString} from '../i18n/i18n-string';
import {Action} from './action';
import {Element} from './element';
import {EventPhase} from './event-phase.enum';

export abstract class Event<T> extends Element {
    private _type: T;
    private readonly _preActions: Array<Action>;
    private readonly _postActions: Array<Action>;
    private _message: I18nString;

    protected constructor(type: T, id: string) {
        super(id);
        this._type = type;
        this._preActions = [];
        this._postActions = [];
        this._message = new I18nString('');
    }

    get type(): T {
        return this._type;
    }

    set type(value: T) {
        this._type = value;
    }

    get preActions(): Array<Action> {
        return this._preActions;
    }

    get postActions(): Array<Action> {
        return this._postActions;
    }

    get message(): I18nString {
        return this._message;
    }

    set message(value: I18nString) {
        this._message = value;
    }

    public addAction(action: Action, phase: EventPhase): void {
        if (!action) {
            throw new Error('Action is undefined');
        }
        if (!phase) {
            throw new Error('Event phase is undefined');
        }
        if (phase === EventPhase.PRE) {
            this._preActions.push(action);
        } else {
            this._postActions.push(action);
        }
    }

    public isEmpty(): boolean {
        return this.preActions.length === 0 && this.postActions.length === 0 && this.message.isEmpty();
    }
}
