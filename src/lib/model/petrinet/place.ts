import {I18nString} from '../i18n/i18n-string';
import {NodeElement} from './node-element';
import {ResourceScope} from './resource-scope.enum';

export class Place extends NodeElement {
    private _marking: number;
    private _scope: ResourceScope = ResourceScope.USECASE;

    constructor(x: number, y: number, id: string) {
        super(id, x, y, new I18nString(''));
        this._marking = 0;
    }

    get marking(): number {
        return this._marking;
    }

    set marking(value: number) {
        this._marking = value;
    }

    get scope(): ResourceScope {
        return this._scope;
    }

    set scope(value: ResourceScope) {
        this._scope = value;
    }

    public clone(): Place {
        const cloned = new Place(this.x, this.y, this.id);
        cloned.title = this.title?.clone();
        cloned._marking = this._marking;
        cloned.scope = this._scope;
        this.properties.forEach((value, key) => cloned.properties.set(key, value));
        return cloned;
    }
}
