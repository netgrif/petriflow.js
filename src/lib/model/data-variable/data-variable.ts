import {I18nString} from '../i18n/i18n-string';
import {Action} from '../petrinet/action';
import {EventPhase} from '../petrinet/event-phase.enum';
import {Component} from './component';
import {DataEvent} from './data-event';
import {DataEventType} from './data-event-type.enum';
import {DataType} from './data-type.enum';
import {Expression} from './expression';
import {Option} from './option';
import {Validation} from './validation';

export class DataVariable {
    private _id: string;
    private _title: I18nString;
    private _placeholder: I18nString;
    private _desc: I18nString;
    private _options: Array<Option>;
    private _optionsInit?: Expression;
    private _validations: Array<Validation>;
    private _init?: Expression;
    private _inits: Array<Expression>;
    private _component?: Component;
    private _type: DataType;
    private _immediate: boolean;
    private _encryption?: string;
    private _remote?: boolean;
    private _actionRef: Array<string>;
    private _events: Map<DataEventType, DataEvent>;
    private _length?: number;
    private _allowedNets: Array<string>;

    constructor(id: string, type: DataType) {
        this._id = id;
        this._title = new I18nString('');
        this._placeholder = new I18nString('');
        this._desc = new I18nString('');
        this._type = type;
        this._options = new Array<Option>();
        this._validations = [];
        this._inits = [];
        this._immediate = false;
        this._actionRef = [];
        this._events = new Map<DataEventType, DataEvent>();
        this._allowedNets = [];
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    get placeholder(): I18nString {
        return this._placeholder;
    }

    set placeholder(value: I18nString) {
        this._placeholder = value;
    }

    get desc(): I18nString {
        return this._desc;
    }

    set desc(value: I18nString) {
        this._desc = value;
    }

    get options(): Array<Option> {
        return this._options;
    }

    set options(value: Array<Option>) {
        this._options = value;
    }

    get optionsInit(): Expression | undefined {
        return this._optionsInit;
    }

    set optionsInit(value: Expression | undefined) {
        this._optionsInit = value;
    }

    getValidations(): Array<Validation> | undefined {
        return this._validations;
    }

    addValidation(value: Validation) {
        if (!this._validations)
            this._validations = [];
        this._validations.push(value);
    }

    get init(): Expression | undefined {
        return this._init;
    }

    set init(value: Expression | undefined) {
        this._init = value;
    }

    get inits(): Array<Expression> {
        return this._inits;
    }

    set inits(value: Array<Expression>) {
        this._inits = value;
    }

    get component(): Component | undefined {
        return this._component;
    }

    set component(value: Component | undefined) {
        this._component = value;
    }

    get type(): DataType {
        return this._type;
    }

    set type(value: DataType) {
        this._type = value;
    }

    get immediate(): boolean {
        return this._immediate;
    }

    set immediate(value: boolean) {
        this._immediate = value;
    }

    get encryption(): string | undefined {
        return this._encryption;
    }

    set encryption(value: string | undefined) {
        this._encryption = value;
    }

    get remote(): boolean | undefined {
        return this._remote;
    }

    set remote(value: boolean | undefined) {
        this._remote = value;
    }

    get actionRef(): Array<string> {
        return this._actionRef;
    }

    set actionRef(value: Array<string>) {
        this._actionRef = value;
    }

    getEvents(): Array<DataEvent> {
        return Array.from(this._events.values());
    }

    getEvent(type: DataEventType): DataEvent | undefined {
        return this._events.get(type);
    }

    addEvent(value: DataEvent) {
        if (this._events.has(value.type)) {
            throw new Error(`Duplicate event of type ${value.type}`);
        }
        this._events.set(value.type, value);
    }

    removeEvent(type: DataEventType) {
        this._events.delete(type);
    }

    get length(): number | undefined {
        return this._length;
    }

    set length(value: number | undefined) {
        this._length = value;
    }

    get allowedNets(): Array<string> {
        return this._allowedNets;
    }

    set allowedNets(value: Array<string>) {
        this._allowedNets = value;
    }

    public mergeEvent(event: DataEvent) {
        if (this._events.has(event.type)) {
            const oldEvent = this._events.get(event.type);
            if (!oldEvent) return;
            oldEvent.preActions.push(...event.preActions);
            oldEvent.postActions.push(...event.postActions);
        } else {
            this._events.set(event.type, event);
        }
    }

    public addAction(action: Action, type: DataEventType, phase?: EventPhase): void {
        if (!this._events.has(type)) {
            this._events.set(type, new DataEvent(type));
        }
        if (!phase) {
            phase = (type === DataEventType.GET ? EventPhase.PRE : EventPhase.POST);
        }
        this._events.get(type)?.addAction(action, phase);
    }

    public clone(): DataVariable {
        const data = new DataVariable(this._id, this._type);
        data._title = this._title.clone();
        data._placeholder = this._placeholder.clone();
        data._desc = this._desc.clone();
        data._options = this._options?.map(o => o.clone());
        this._validations.forEach(v => data.addValidation(v.clone()));
        data._inits = this._inits?.map(i => i.clone());
        data._init = this._init?.clone();
        data._component = this._component?.clone();
        data._immediate = this._immediate;
        data._encryption = this._encryption;
        data._type = this._type;
        data._remote = this._remote;
        data._actionRef = [...this._actionRef];
        this._events.forEach((event, type) => {
            data._events.set(type, event.clone());
        });
        data._length = this._length;
        data._allowedNets = [...this._allowedNets];
        data._optionsInit = this._optionsInit?.clone();
        return data;
    }
}
