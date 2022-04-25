import {Action} from './action';
import {Element} from './element';
import {EventPhase} from './event-phase.enum';

export abstract class Event<T> extends Element {
    private _type: T;
    private readonly _preActions: Array<Action>;
    private readonly _postActions: Array<Action>;

    protected constructor(type: T, id: string) {
        super(id);
        this._type = type;
        this._preActions = [];
        this._postActions = [];
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
}
