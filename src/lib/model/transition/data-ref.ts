import {Component} from '../data-variable/component';
import {DataEventSource} from '../data-variable/data-event-source';
import {Property} from '../data-variable/property';
import {DataRefLogic} from './data-ref-logic';

export class DataRef extends DataEventSource {
    private _id: string;
    private _logic: DataRefLogic;
    private _component?: Component;
    private _properties?: Array<Property>;

    constructor(id: string) {
        super();
        this._id = id;
        this._logic = new DataRefLogic();
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

    get properties(): Array<Property> | undefined {
        return this._properties;
    }

    set properties(value: Array<Property> | undefined) {
        this._properties = value;
    }

    getPropertyByKey(key: string): Property | undefined {
        return this._properties?.filter(property => property.key === key )[0];
    }

    public clone(): DataRef {
        const cloned = new DataRef(this._id);
        cloned._logic = this._logic?.clone();
        cloned._component = this._component?.clone();
        cloned._properties = this._properties?.map(p => p.clone());
        this.getEvents().forEach(event => cloned.addEvent(event.clone()));
        return cloned;
    }
}
