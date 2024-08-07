import {CaseEventType} from './case-event-type.enum';
import {Event} from './event';

export class CaseEvent extends Event<CaseEventType> {

    constructor(type: CaseEventType, id: string) {
        super(type, id);
    }

    public clone(): CaseEvent {
        const cloned = new CaseEvent(this.type, this.id);
        this.preActions.forEach(a => cloned.preActions.push(a));
        this.postActions.forEach(a => cloned.postActions.push(a));
        this.properties?.forEach(property => cloned.properties?.push(property.clone()))
        cloned.message = this.message?.clone();
        return cloned;
    }
}
