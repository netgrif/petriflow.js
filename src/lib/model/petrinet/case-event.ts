import {Event} from './event';
import {CaseEventType} from './case-event-type.enum';

export class CaseEvent extends Event<CaseEventType> {

    constructor(type: CaseEventType) {
        super(type);
    }

    public clone(): CaseEvent {
        const event = new CaseEvent(this.type);
        event.id = this.id;
        this.preActions.forEach(a => event.preActions.push(a));
        this.postActions.forEach(a => event.postActions.push(a));
        return event;
    }
}
