import {Event} from './event';

export abstract class EventSource<T extends Event<S>, S> {
    private readonly _events: Map<S, T>;

    protected constructor() {
        this._events = new Map();
    }

    protected get events(): Map<S, T> {
        return this._events;
    }

    getEvents(): Array<T> {
        return Array.from(this._events.values());
    }

    getEvent(type: S): T | undefined {
        return this._events.get(type);
    }

    addEvent(event: T) {
        if (this._events.has(event.type)) {
            throw new Error(`Duplicate event of type ${event.type}`);
        }
        this._events.set(event.type, event);
    }

    removeEvent(type: S) {
        this._events.delete(type);
    }

    public mergeEvent(event: T) {
        if (this._events.has(event.type)) {
            const oldEvent = this._events.get(event.type);
            if (!oldEvent) return;
            oldEvent.preActions.push(...event.preActions);
            oldEvent.postActions.push(...event.postActions);
        } else {
            this._events.set(event.type, event);
        }
    }
}
