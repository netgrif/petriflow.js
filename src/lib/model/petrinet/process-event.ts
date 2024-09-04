import {Event} from './event';
import {ProcessEventType} from './process-event-type.enum';

export class ProcessEvent extends Event<ProcessEventType> {

    constructor(type: ProcessEventType, id: string) {
        super(type, id);
    }

    public clone(): ProcessEvent {
        const cloned = new ProcessEvent(this.type, this.id);
        this.preActions.forEach(a => cloned.preActions.push(a.clone()));
        this.postActions.forEach(a => cloned.postActions.push(a.clone()));
        this.properties.forEach((value, key) => cloned.properties.set(key, value));
        cloned.message = this.message?.clone();
        return cloned;
    }
}
