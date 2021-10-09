import {TriggerType} from './trigger-type.enum';

export class Trigger {
    private _type: TriggerType;
    private _delay: string; // TODO: refactor, inheritance
    private _exact: Date;

    get type(): TriggerType {
        return this._type;
    }

    set type(value: TriggerType) {
        this._type = value;
    }

    get delay(): string {
        return this._delay;
    }

    set delay(value: string) {
        this._delay = value;
    }

    get exact(): Date {
        return this._exact;
    }

    set exact(value: Date) {
        this._exact = value;
    }

    public clone(): Trigger {
        const trigger = new Trigger();
        trigger._type = this._type;
        trigger._delay = this._delay;
        trigger._exact = this._exact;
        return trigger;
    }
}
