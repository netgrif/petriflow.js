import {Component} from '../data-variable/component';
import {DataEventSource} from '../data-variable/data-event-source';
import {DataRefLogic} from './data-ref-logic';

export class DataRef extends DataEventSource {
    private _id: string;
    private _logic: DataRefLogic;
    private _component?: Component;
    private _properties: Map<string, string>;

    constructor(id: string) {
        super();
        this._id = id;
        this._logic = new DataRefLogic();
        this._properties = new Map<string, string>();
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

    get component(): Component | undefined {
        return this._component;
    }

    set component(value: Component | undefined) {
        this._component = value;
    }

    get properties(): Map<string, string> {
        return this._properties;
    }

    set properties(value: Map<string, string>) {
        this._properties = value;
    }

    public clone(): DataRef {
        const cloned = new DataRef(this._id);
        cloned._logic = this._logic?.clone();
        cloned._component = this._component?.clone();
        this.getEvents().forEach(event => cloned.addEvent(event.clone()));
        this.properties.forEach((value, key) => cloned.properties.set(key, value));
        return cloned;
    }
}
