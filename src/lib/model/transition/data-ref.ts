import {Component} from '../data-variable/component';
import {DataEvent} from '../data-variable/data-event';
import {DataEventType} from '../data-variable/data-event-type.enum';
import {Action} from '../petrinet/action';
import {EventPhase} from '../petrinet/event-phase.enum';
import {DataLayout} from './data-layout';
import {DataRefLogic} from './data-ref-logic';

export class DataRef {
    private _id: string;
    private _logic: DataRefLogic;
    private _layout: DataLayout;
    private _component?: Component;
    private _events: Map<DataEventType, DataEvent>;

    constructor(id: string) {
        this._id = id;
        this._logic = new DataRefLogic();
        this._layout = new DataLayout();
        this._events = new Map<DataEventType, DataEvent>();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get logic(): DataRefLogic {
        return this._logic;
    }

    set logic(value: DataRefLogic) {
        this._logic = value;
    }

    get layout(): DataLayout {
        return this._layout;
    }

    set layout(value: DataLayout) {
        this._layout = value;
    }

    get component(): Component | undefined {
        return this._component;
    }

    set component(value: Component | undefined) {
        this._component = value;
    }

    getEvents(): Array<DataEvent> {
        return Array.from(this._events.values());
    }

    getEvent(type: DataEventType): DataEvent | undefined {
        return this._events.get(type);
    }

    addEvent(event: DataEvent) {
        if (this._events.has(event.type)) {
            throw new Error(`Duplicate event of type ${event.type}`);
        }
        this._events.set(event.type, event);
    }

    removeEvent(type: DataEventType) {
        this._events.delete(type);
    }

    public clone(): DataRef {
        const cloned = new DataRef(this._id);
        cloned._logic = this._logic?.clone();
        cloned._layout = this._layout?.clone();
        cloned._component = this._component?.clone();
        this._events.forEach((event, type) => {
            cloned._events.set(type, event.clone());
        });
        return cloned;
    }

    public mergeEvent(event: DataEvent) {
        if (this._events.has(event.type)) {
            const oldEvent = this._events.get(event.type);
            if (!oldEvent) return;
            oldEvent.preActions.push(...event.preActions);
            oldEvent.postActions.push(...event.postActions);
        } else {
            this._events.set(event.type, event);
        }
    }

    public addAction(action: Action, type: DataEventType, phase?: EventPhase): void {
        if (!this._events.has(type)) {
            this._events.set(type, new DataEvent(type, ''));
        }
        if (!phase) {
            phase = (type === DataEventType.GET ? EventPhase.PRE : EventPhase.POST);
        }
        this._events.get(type)?.addAction(action, phase);
    }
}
