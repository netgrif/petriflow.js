import {AbstractLayoutItem} from '../../abstract-layout-item';
import {FlexItemProperties} from './flex-item-properties';

export class FlexItem extends AbstractLayoutItem {

    private _properties: FlexItemProperties;

    constructor() {
        super();
        this._properties = new FlexItemProperties();
    }

    get properties(): FlexItemProperties {
        return this._properties;
    }

    set properties(value: FlexItemProperties) {
        this._properties = value;
    }

    public clone() {
        const cloned: FlexItem = new FlexItem();
        cloned.dataRef = this.dataRef?.clone();
        cloned.flex = this.flex?.clone();
        cloned.grid = this.grid?.clone();
        cloned.properties = this._properties.clone();
        return cloned;
    }
}
