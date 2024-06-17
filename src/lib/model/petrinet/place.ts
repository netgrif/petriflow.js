import {I18nString} from '../i18n/i18n-string';
import {FunctionScope} from './function-scope.enum';
import {NodeElement} from './node-element';

export class Place extends NodeElement {
    private _static: boolean;
    private _marking: number;
    private _scope: FunctionScope;

    constructor(x: number, y: number, isStatic: boolean, id: string, _scope: FunctionScope) {
        super(id, x, y, new I18nString(''));
        this._static = isStatic;
        this._marking = 0;
        this._scope = _scope;
    }

    get static(): boolean {
        return this._static;
    }

    set static(value: boolean) {
        this._static = value;
    }

    get marking(): number {
        return this._marking;
    }

    set marking(value: number) {
        this._marking = value;
    }

    get scope(): FunctionScope {
        return this._scope;
    }

    set scope(value: FunctionScope) {
        this._scope = value;
    }

    public clone(): Place {
        const cloned = new Place(this.x, this.y, this.static, this.id, this.scope);
        cloned.title = this.title?.clone();
        cloned._marking = this._marking;
        this.properties?.forEach(property => cloned.properties?.push(property.clone()))
        return cloned;
    }
}
