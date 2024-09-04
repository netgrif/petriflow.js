import {Event} from '../petrinet/event';
import {DataEventType} from './data-event-type.enum';

export class DataEvent extends Event<DataEventType> {

    constructor(type: DataEventType, id: string) {
        super(type, id);
    }

    public clone(): DataEvent {
        const cloned = new DataEvent(this.type, this.id);
        this.preActions.forEach(a => cloned.preActions.push(a));
        this.postActions.forEach(a => cloned.postActions.push(a));
        this.properties.forEach((value, key) => cloned.properties.set(key, value));
        cloned.message = this.message?.clone();
        return cloned;
    }
}
