import {I18nString} from '../i18n/i18n-string';
import {I18nWithDynamic} from "../i18n/i18n-with-dynamic";
import {ResourceScope} from '../petrinet/resource-scope.enum';
import {Component} from './component';
import {DataEventSource} from './data-event-source';
import {DataType} from './data-type.enum';
import {Option} from './option';
import {Validation} from './validation';

export class DataVariable extends DataEventSource {
    private _id: string;
    private _title: I18nString;
    private _placeholder: I18nString;
    private _desc: I18nString;
    private _values?: Array<I18nWithDynamic>;
    private _options: Array<Option>
    private _validations: Array<Validation>;
    private _init?: I18nWithDynamic;
    private _component?: Component;
    private _type: DataType;
    private _immediate: boolean;
    private _encryption?: string;
    private _allowedNets: Array<string>;
    private _properties: Map<string, string>;
    private _scope: ResourceScope = ResourceScope.USECASE;

    constructor(id: string, type: DataType) {
        super();
        this._id = id;
        this._title = new I18nString('');
        this._placeholder = new I18nString('');
        this._desc = new I18nString('');
        this._type = type;
        this._options = new Array<Option>();
        this._validations = [];
        this._immediate = false;
        this._allowedNets = [];
        this._properties = new Map<string, string>;
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

    get values(): Array<I18nWithDynamic> | undefined {
        return this._values;
    }

    set values(value: Array<I18nWithDynamic> | undefined) {
        this._values = value;
    }

    get options(): Array<Option> {
        return this._options;
    }

    set options(value: Array<Option>) {
        this._options = value;
    }

    get validations(): Array<Validation> {
        return this._validations;
    }

    set validations(value: Array<Validation>) {
        this._validations = value;
    }

    get init(): I18nWithDynamic | undefined {
        return this._init;
    }

    set init(value: I18nWithDynamic | undefined) {
        this._init = value;
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

    get allowedNets(): Array<string> {
        return this._allowedNets;
    }

    set allowedNets(value: Array<string>) {
        this._allowedNets = value;
    }

    get properties(): Map<string, string> {
        return this._properties;
    }

    set properties(value: Map<string, string>) {
        this._properties = value;
    }

    get scope(): ResourceScope {
        return this._scope;
    }

    set scope(value: ResourceScope) {
        this._scope = value;
    }

    public clone(): DataVariable {
        const cloned = new DataVariable(this._id, this._type);
        cloned._title = this._title?.clone();
        cloned._placeholder = this._placeholder?.clone();
        cloned._desc = this._desc?.clone();
        cloned._values = this._values?.map(value => value.clone());
        cloned._options = this._options?.map(o => o.clone());
        cloned._validations = this._validations?.map(v => v.clone());
        cloned._init = this._init?.clone();
        cloned._component = this._component?.clone();
        cloned._immediate = this._immediate;
        cloned._encryption = this._encryption;
        cloned._allowedNets = [...this._allowedNets];
        cloned._scope = this._scope;
        this._properties.forEach((value, key) => cloned.properties.set(key, value));
        this.getEvents().forEach(event => cloned.addEvent(event.clone()));
        return cloned;
    }

    public compare(other: DataVariable): number {
        return this.id.localeCompare(other.id);
    }
}
