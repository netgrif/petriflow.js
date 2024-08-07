import {AbstractLayoutItem} from '../../abstract-layout-item';
import {GridItemProperties} from './grid-item-properties';

export class GridItem extends AbstractLayoutItem {
    private _properties: GridItemProperties;

    constructor() {
        super();
        this._properties = new GridItemProperties();
    }

    get properties(): GridItemProperties {
        return this._properties;
    }

    set properties(value: GridItemProperties) {
        this._properties = value;
    }

    public clone() {
        const cloned: GridItem = new GridItem();
        cloned.properties = this._properties.clone();
        cloned.dataRef = this.dataRef?.clone();
        cloned.flex = this.flex?.clone();
        cloned.grid = this.grid?.clone();
        return cloned;
    }
}
