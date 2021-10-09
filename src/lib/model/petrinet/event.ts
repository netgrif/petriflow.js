import {Action} from './action';
import {EventPhase} from './event-phase.enum';

export abstract class Event<T> {
    private _type: T;
    private _id: string;
    private _preActions: Array<Action>;
    private _postActions: Array<Action>;

    protected constructor(type: T) {
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

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
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
