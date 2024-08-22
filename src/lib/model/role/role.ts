import {Property} from '../data-variable/property';
import {I18nString} from '../i18n/i18n-string';
import {EventSource} from '../petrinet/event-source';
import {FunctionScope} from '../petrinet/function-scope.enum';
import {RoleEvent} from './role-event';
import {RoleEventType} from './role-event-type.enum';

export class Role extends EventSource<RoleEvent, RoleEventType> {
    public static readonly ANONYMOUS = 'anonymous';
    public static readonly DEFAULT = 'defaultRole';

    private _id: string;
    private _title: I18nString;
    private _scope: FunctionScope;
    private _properties?: Array<Property>;

    constructor(id: string, _scope: FunctionScope = FunctionScope.USECASE) {
        super();
        this._id = id;
        this._title = new I18nString('');
        this._scope = _scope;
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

    get properties(): Array<Property> | undefined {
        return this._properties;
    }

    set properties(value: Array<Property> | undefined) {
        this._properties = value;
    }

    get scope(): FunctionScope {
        return this._scope;
    }

    set scope(value: FunctionScope) {
        this._scope = value;
    }

    public clone(): Role {
        const cloned = new Role(this._id, this._scope);
        cloned._title = this._title?.clone();
        cloned._properties = this._properties?.map(p => p.clone());
        this.getEvents().forEach(event => cloned.addEvent(event.clone()));
        return cloned;
    }

    public compare(other: Role): number {
        return this.id.localeCompare(other.id);
    }
}
