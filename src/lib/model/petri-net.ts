import {I18nString} from './i18n/i18n-string';
import {ProcessRoleRef} from './petrinet/process-role-ref';
import {ProcessUserRef} from './petrinet/process-user-ref';
import {ProcessEvent} from './petrinet/process-event';
import {CaseEvent} from './petrinet/case-event';
import {Transaction} from './petrinet/transaction';
import {Role} from './role/role';
import {DataVariable} from './data-variable/data-variable';
import {Mapping} from './petrinet/mapping';
import {I18nTranslations} from './i18n/i18n-translations';
import {Transition} from './transition/transition';
import {Place} from './petrinet/place';
import {Arc} from './arc/arc';
import {I18nWithDynamic} from './i18n/i18n-with-dynamic';
import {ProcessEventType} from './petrinet/process-event-type.enum';
import {CaseEventType} from './petrinet/case-event-type.enum';
import {DataType} from './data-variable/data-type.enum';

export class PetriNet {
    private _id: string;
    private _version?: string;
    private _initials: string;
    private _title: I18nString;
    private _icon?: string;
    private _defaultRole: boolean;
    private _transitionRole: boolean;
    private _caseName?: I18nWithDynamic;
    private _roleRefs?: Map<string, ProcessRoleRef>;
    private _userRefs?: Map<string, ProcessUserRef>;
    private _processEvents?: Map<ProcessEventType, ProcessEvent>;
    private _caseEvents?: Map<CaseEventType, CaseEvent>;
    private _transactions?: Map<string, Transaction>;
    private _roles?: Map<string, Role>;
    private _data?: Map<string, DataVariable>;
    private _mappings?: Map<string, Mapping>;
    private _i18ns?: Map<string, I18nTranslations>;
    private _transitions?: Map<string, Transition>;
    private _places?: Map<string, Place>;
    private _arcs?: Map<string, Arc>;

    constructor() {
        this._id = 'new_model';
        this._version = '';
        this._initials = 'NEW';
        this._title = new I18nString('New Model');
        this._icon = 'device_hub';
        this._defaultRole = true;
        this._transitionRole = false;
        this._caseName = new I18nWithDynamic('');
        this._transitions = new Map<string, Transition>();
        this._places = new Map<string, Place>();
        this._arcs = new Map<string, Arc>();
        this._data = new Map<string, DataVariable>();
        this._transactions = new Map<string, Transaction>();
        this._roles = new Map<string, Role>();
        this._roleRefs = new Map<string, ProcessRoleRef>();
        this._userRefs = new Map<string, ProcessUserRef>();
        this._i18ns = new Map<string, I18nTranslations>();
        this._processEvents = new Map<ProcessEventType, ProcessEvent>();
        this._caseEvents = new Map<CaseEventType, CaseEvent>();
        this._mappings = new Map<string, Mapping>();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get version(): string {
        return this._version;
    }

    set version(value: string) {
        this._version = value;
    }

    get initials(): string {
        return this._initials;
    }

    set initials(value: string) {
        this._initials = value;
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    get icon(): string {
        return this._icon;
    }

    set icon(value: string) {
        this._icon = value;
    }

    get defaultRole(): boolean {
        return this._defaultRole;
    }

    set defaultRole(value: boolean) {
        this._defaultRole = value;
    }

    get transitionRole(): boolean {
        return this._transitionRole;
    }

    set transitionRole(value: boolean) {
        this._transitionRole = value;
    }

    get caseName(): I18nWithDynamic {
        return this._caseName;
    }

    set caseName(value: I18nWithDynamic) {
        this._caseName = value;
    }

    getRoleRefs(): Array<ProcessRoleRef> {
        return Array.from(this._roleRefs.values());
    }

    getRoleRef(id: string): ProcessRoleRef {
        return this._roleRefs.get(id);
    }

    addRoleRef(roleRef: ProcessRoleRef) {
        if (!this._roles.has(roleRef.id)) {
            throw new Error(`Referenced role with id ${roleRef.id} does not exist`);
        }
        if (this._roleRefs.has(roleRef.id)) {
            throw new Error(`Duplicate role ref with id ${roleRef.id}`);
        }
        this._roleRefs.set(roleRef.id, roleRef);
    }

    removeRoleRef(id: string) {
        this._roleRefs.delete(id);
    }

    getUserRefs(): Array<ProcessUserRef> {
        return Array.from(this._userRefs.values());
    }

    getUserRef(id: string): ProcessUserRef {
        return this._userRefs.get(id);
    }

    addUserRef(userRef: ProcessUserRef) {
        if (!this._data.has(userRef.id)) {
            throw new Error(`Referenced user field with id ${userRef.id} does not exist`);
        }
        if (this._data.get(userRef.id).type !== DataType.USER_LIST) {
            throw new Error(`Referenced field with id ${userRef.id} is not user field`);
        }
        if (this._userRefs.has(userRef.id)) {
            throw new Error(`Duplicate user ref with id ${userRef.id}`);
        }
        this._userRefs.set(userRef.id, userRef);
    }

    removeUserRef(id: string) {
        this._userRefs.delete(id);
    }

    getProcessEvents(): Array<ProcessEvent> {
        return Array.from(this._processEvents.values());
    }

    getProcessEvent(type: ProcessEventType): ProcessEvent {
        return this._processEvents.get(type);
    }

    addProcessEvent(event: ProcessEvent) {
        if (this._processEvents.has(event.type)) {
            throw new Error(`Duplicate process event of type ${event.type}`);
        }
        this._processEvents.set(event.type, event);
    }

    removeProcessEvent(type: ProcessEventType) {
        this._processEvents.delete(type);
    }

    getCaseEvents(): Array<CaseEvent> {
        return Array.from(this._caseEvents.values());
    }

    getCaseEvent(type: CaseEventType): CaseEvent {
        return this._caseEvents.get(type);
    }

    addCaseEvent(event: CaseEvent) {
        if (this._caseEvents.has(event.type)) {
            throw new Error(`Duplicate case event of type ${event.type}`);
        }
        this._caseEvents.set(event.type, event);
    }

    removeCaseEvent(type: CaseEventType) {
        this._caseEvents.delete(type);
    }

    getTransactions(): Array<Transaction> {
        return Array.from(this._transactions.values());
    }

    getTransaction(id: string): Transaction {
        return this._transactions.get(id);
    }

    addTransaction(transaction: Transaction) {
        if (this._transactions.has(transaction.id)) {
            throw new Error(`Duplicate transaction with id ${transaction.id}`);
        }
        this._transactions.set(transaction.id, transaction);
    }

    removeTransaction(id: string) {
        this._transactions.delete(id);
    }

    getRoles(): Array<Role> {
        return Array.from(this._roles.values());
    }

    getRole(id: string): Role {
        return this._roles.get(id);
    }

    addRole(role: Role) {
        if (this._roles.has(role.id)) {
            throw new Error(`Duplicate role with id ${role.id}`);
        }
        this._roles.set(role.id, role);
    }

    removeRole(id: string) {
        this._roles.delete(id);
    }

    getDataSet(): Array<DataVariable> {
        return Array.from(this._data.values());
    }

    getData(id: string): DataVariable {
        return this._data.get(id);
    }

    addData(dataVariable: DataVariable) {
        if (this._data.has(dataVariable.id)) {
            throw new Error(`Duplicate data variable with id ${dataVariable.id}`);
        }
        this._data.set(dataVariable.id, dataVariable);
    }

    removeData(id: string) {
        this._data.delete(id);
    }

    getMappings(): Array<Mapping> {
        return Array.from(this._mappings.values());
    }

    getMapping(id: string): Mapping {
        return this._mappings.get(id);
    }

    addMapping(mapping: Mapping) {
        if (this._mappings.has(mapping.id)) {
            throw new Error(`Duplicate mapping with id ${mapping.id}`);
        }
        this._mappings.set(mapping.id, mapping);
    }

    removeMapping(id: string) {
        this._mappings.delete(id);
    }

    getI18ns(): Array<I18nTranslations> {
        return Array.from(this._i18ns.values());
    }

    getI18n(locale: string): I18nTranslations {
        return this._i18ns.get(locale);
    }

    addI18n(i18n: I18nTranslations) {
        if (this._i18ns.has(i18n.locale)) {
            throw new Error(`Duplicate i18n with locale ${i18n.locale}`);
        }
        this._i18ns.set(i18n.locale, i18n);
    }

    removeI18n(locale: string) {
        this._i18ns.delete(locale);
    }

    getTransitions(): Array<Transition> {
        return Array.from(this._transitions.values());
    }

    getTransition(id: string): Transition {
        return this._transitions.get(id);
    }

    addTransition(transition: Transition) {
        if (this._transitions.has(transition.id)) {
            throw new Error(`Duplicate transition with id ${transition.id}`);
        }
        this._transitions.set(transition.id, transition);
    }

    removeTransition(id: string) {
        this._transitions.delete(id);
    }

    getPlaces(): Array<Place> {
        return Array.from(this._places.values());
    }

    getPlace(id: string): Place {
        return this._places.get(id);
    }

    addPlace(place: Place) {
        if (this._places.has(place.id)) {
            throw new Error(`Duplicate place with id ${place.id}`);
        }
        this._places.set(place.id, place);
    }

    removePlace(id: string) {
        this._places.delete(id);
    }

    getArcs(): Array<Arc> {
        return Array.from(this._arcs.values());
    }

    getArc(id: string): Arc {
        return this._arcs.get(id);
    }

    addArc(arc: Arc) {
        if (this._arcs.has(arc.id)) {
            throw new Error(`Duplicate arc with id ${arc.id}`);
        }
        this._arcs.set(arc.id, arc);
    }

    removeArc(id: string) {
        this._arcs.delete(id);
    }

    public clone(): PetriNet {
        const model = new PetriNet();
        model._id = this._id;
        model._version = this._version;
        model._initials = this._initials;
        model._title = this._title.clone();
        model._icon = this._icon;
        model._defaultRole = this._defaultRole;
        model._transitionRole = this._transitionRole;
        model._caseName = this._caseName.clone();
        this._transactions.forEach(t => model.addTransaction(t.clone()));
        this._roles.forEach(r => model.addRole(r.clone()));
        this._data.forEach(d => model.addData(d.clone()));
        this._transitions.forEach(t => model.addTransition(t.clone()));
        this._places.forEach(p => model.addPlace(p.clone()));
        this._arcs.forEach(a => model.addArc(a.clone()));
        this._userRefs.forEach(ref => model.addUserRef(ref.clone()));
        this._i18ns.forEach(i => model.addI18n(i.clone()));
        this._processEvents.forEach(e => model.addProcessEvent(e.clone()));
        this._caseEvents.forEach(e => model.addCaseEvent(e.clone()));
        this._mappings.forEach(m => model.addMapping(m.clone()));
        this._roleRefs.forEach(ref => model.addRoleRef(ref.clone()));
        return model;
    }
}
