import {EventSource} from '../petrinet/event-source';
import {TransitionEvent} from './transition-event';
import {TransitionEventType} from './transition-event-type.enum';

export class TransitionEventSource extends EventSource<TransitionEvent, TransitionEventType> {
    public constructor() {
        super();
    }
}
