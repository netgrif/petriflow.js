import {I18nString} from '../i18n/i18n-string';
import {EventSource} from '../petrinet/event-source';
import {ResourceScope} from '../petrinet/resource-scope.enum';
import {RoleEvent} from './role-event';
import {RoleEventType} from './role-event-type.enum';

export class Role extends EventSource<RoleEvent, RoleEventType> {
    public static readonly ANONYMOUS = 'anonymous';
    public static readonly DEFAULT = 'defaultRole';

    private _id: string;
    private _title: I18nString;
    private _scope: ResourceScope;
    private _properties: Map<string, string>;

    constructor(id: string, _scope: ResourceScope = ResourceScope.USECASE) {
        super();
        this._id = id;
        this._title = new I18nString('');
        this._scope = _scope;
        this._properties = new Map<string, string>();
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

    public clone(): Role {
        const cloned = new Role(this._id, this._scope);
        cloned._title = this._title?.clone();
        this.properties.forEach((value, key) => cloned.properties.set(key, value));
        this.getEvents().forEach(event => cloned.addEvent(event.clone()));
        return cloned;
    }

    public compare(other: Role): number {
        return this.id.localeCompare(other.id);
    }
}
