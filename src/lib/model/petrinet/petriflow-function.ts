import {ResourceScope} from './resource-scope.enum';

export class PetriflowFunction {
    private _name: string;
    private _scope: ResourceScope = ResourceScope.USECASE;
    private _definition: string;

    constructor(name: string, scope: ResourceScope, definition = '') {
        this._name = name;
        this._scope = scope;
        this._definition = definition;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get scope(): ResourceScope {
        return this._scope;
    }

    set scope(value: ResourceScope) {
        this._scope = value;
    }

    get definition(): string {
        return this._definition;
    }

    set definition(value: string) {
        this._definition = value;
    }

    public clone(): PetriflowFunction {
        return new PetriflowFunction(this.name, this.scope, this.definition);
    }

    public compare(other: PetriflowFunction): number {
        return this.name.localeCompare(other.name);
    }
}
