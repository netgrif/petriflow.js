import {Event} from './event';
import {ProcessEventType} from './process-event-type.enum';

export class ProcessEvent extends Event<ProcessEventType> {

    constructor(type: ProcessEventType) {
        super(type);
    }

    public clone(): ProcessEvent {
        const event = new ProcessEvent(this.type);
        event.id = this.id;
        this.preActions.forEach(a => event.preActions.push(a.clone()));
        this.postActions.forEach(a => event.postActions.push(a.clone()));
        return event;
    }
}
