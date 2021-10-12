import {TriggerType} from './trigger-type.enum';

export class Trigger {
    private _type: TriggerType;
    private _delay?: string; // TODO: refactor, inheritance
    private _exact?: Date;

    constructor(type = TriggerType.AUTO) {
        this._type = type;
    }

    get type(): TriggerType {
        return this._type;
    }

    set type(value: TriggerType) {
        this._type = value;
    }

    get delay(): string | undefined {
        return this._delay;
    }

    set delay(value: string | undefined) {
        this._delay = value;
    }

    get exact(): Date | undefined {
        return this._exact;
    }

    set exact(value: Date | undefined) {
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
