import {Event} from '../petrinet/event';
import {DataEventType} from './data-event-type.enum';

export class DataEvent extends Event<DataEventType> {

    constructor(type: DataEventType) {
        super(type);
    }

    public clone(): DataEvent {
        const cloned = new DataEvent(this.type);
        cloned.id = this.id;
        this.preActions.forEach(a => cloned.preActions.push(a));
        this.postActions.forEach(a => cloned.postActions.push(a));
        return cloned;
    }
}
