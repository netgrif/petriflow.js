import {CaseEventType} from './case-event-type.enum';
import {Event} from './event';

export class CaseEvent extends Event<CaseEventType> {

    constructor(type: CaseEventType, id: string) {
        super(type, id);
    }

    public clone(): CaseEvent {
        const event = new CaseEvent(this.type, this.id);
        this.preActions.forEach(a => event.preActions.push(a));
        this.postActions.forEach(a => event.postActions.push(a));
        return event;
    }
}
