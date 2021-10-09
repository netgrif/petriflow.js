import {Property} from './property';
import {Icon} from './icon';

export class Component {
    private _name: string;
    private _properties: Array<Property>;
    private _icons: Array<Icon>;

    constructor(name: string) {
        this._name = name;
        this._properties = new Array<Property>();
        this._icons = new Array<Icon>();
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get properties(): Array<Property> {
        return this._properties;
    }

    set properties(value: Array<Property>) {
        this._properties = value;
    }

    get icons(): Array<Icon> {
        return this._icons;
    }

    set icons(value: Array<Icon>) {
        this._icons = value;
    }

    public clone(): Component {
        const cloned = new Component(this._name);
        cloned.properties = this.properties.map(p => p.clone());
        cloned.icons = this.icons.map(i => i.clone());
        return cloned;
    }
}
