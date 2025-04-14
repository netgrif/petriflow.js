import {Action} from '../petrinet/action';
import {EventPhase} from '../petrinet/event-phase.enum';
import {EventSource} from '../petrinet/event-source';
import {DataEvent} from './data-event';
import {DataEventType} from './data-event-type.enum';

export abstract class DataEventSource extends EventSource<DataEvent, DataEventType> {

    public addAction(action: Action, type: DataEventType, phase?: EventPhase, id: string = ''): void {
        if (!this.events.has(type)) {
            this.addEvent(new DataEvent(type, id));
        }
        if (!phase) {
            phase = (type === DataEventType.GET ? EventPhase.PRE : EventPhase.POST);
        }
        this.events.get(type)?.addAction(action, phase);
    }
}
