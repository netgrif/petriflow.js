import {I18nString} from '../i18n/i18n-string';
import {FunctionScope} from '../petrinet/function-scope.enum';
import {NodeElement} from '../petrinet/node-element';
import {AssignPolicy} from './assign-policy.enum';
import {FinishPolicy} from './finish-policy.enum';
import {FlexContainer} from './flex-layout/container/flex-container';
import {GridContainer} from './grid-layout/container/grid-container';
import {TransitionEventSource} from './transition-event-source';
import {TransitionPermissionRef} from './transition-permission-ref';
import {Trigger} from './trigger';

export class Transition extends NodeElement {
    private _icon?: string;
    private _assignPolicy: AssignPolicy;
    private _finishPolicy: FinishPolicy;
    private _triggers: Array<Trigger>;
    private _roleRefs: Array<TransitionPermissionRef>;
    private _grid?: GridContainer;
    private _flex?: FlexContainer;
    private _eventSource: TransitionEventSource;
    private _scope: FunctionScope = FunctionScope.USECASE;
    private _tags: Map<string, string>;

    constructor(x: number, y: number, id: string) {
        super(id, x, y, new I18nString(''));
        this._assignPolicy = AssignPolicy.MANUAL;
        this._finishPolicy = FinishPolicy.MANUAL;
        this._triggers = [];
        this._roleRefs = [];
        this._eventSource = new TransitionEventSource();
        this._tags = new Map<string, string>();
    }

    get icon(): string | undefined {
        return this._icon;
    }

    set icon(value: string | undefined) {
        this._icon = value;
    }

    get assignPolicy(): AssignPolicy {
        return this._assignPolicy;
    }

    set assignPolicy(value: AssignPolicy) {
        this._assignPolicy = value;
    }

    get finishPolicy(): FinishPolicy {
        return this._finishPolicy;
    }

    set finishPolicy(value: FinishPolicy) {
        this._finishPolicy = value;
    }

    get triggers(): Array<Trigger> {
        return this._triggers;
    }

    set triggers(value: Array<Trigger>) {
        this._triggers = value;
    }

    get roleRefs(): Array<TransitionPermissionRef> {
        return this._roleRefs;
    }

    set roleRefs(value: Array<TransitionPermissionRef>) {
        this._roleRefs = value;
    }

    get eventSource(): TransitionEventSource {
        return this._eventSource;
    }

    set eventSource(value: TransitionEventSource) {
        this._eventSource = value;
    }

    get tags(): Map<string, string> {
        return this._tags;
    }

    set tags(value: Map<string, string>) {
        this._tags = value;
    }

    get grid(): GridContainer | undefined {
        return this._grid;
    }

    set grid(value: GridContainer | undefined) {
        this._grid = value;
    }

    get flex(): FlexContainer | undefined {
        return this._flex;
    }

    set flex(value: FlexContainer | undefined) {
        this._flex = value;
    }

    get scope(): FunctionScope {
        return this._scope;
    }

    set scope(value: FunctionScope) {
        this._scope = value;
    }

    public clone(): Transition {
        const cloned = new Transition(this.x, this.y, this.id);
        cloned.title = this.title?.clone();
        cloned._icon = this._icon;
        cloned._assignPolicy = this._assignPolicy;
        cloned._finishPolicy = this._finishPolicy;
        cloned._triggers = this._triggers.map(item => item.clone());
        cloned._roleRefs = this._roleRefs.map(item => item.clone());
        cloned._flex = this._flex?.clone();
        cloned._grid = this._grid?.clone();
        cloned.properties = this.properties?.map(p => p.clone());
        cloned._scope = this._scope;
        this.eventSource.getEvents().forEach(event => cloned.eventSource.addEvent(event.clone()));
        this.tags.forEach((value, key) => cloned.tags.set(key, value));
        return cloned;
    }
}
