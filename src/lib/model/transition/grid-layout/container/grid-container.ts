import {GridItem} from '../item/grid-item';
import {GridContainerProperties} from './grid-container-properties';

export class GridContainer {

    private _id: string;
    private _items?: Array<GridItem>;
    private _properties: GridContainerProperties;

    constructor(id: string) {
        this._id = id;
        this._properties = new GridContainerProperties();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get items(): Array<GridItem> | undefined {
        return this._items;
    }

    set items(value: Array<GridItem> | undefined) {
        this._items = value;
    }

    get properties(): GridContainerProperties {
        return this._properties;
    }

    set properties(value: GridContainerProperties) {
        this._properties = value;
    }

    addItem(item: GridItem) {
        if (this._items === undefined) {
            this._items = [];
        }
        this._items.push(item);
    }

    getItemById(itemId: string): GridItem | undefined {
        return this._items?.filter(item => item.getContentId() === itemId)[0];
    }

    public clone(): GridContainer {
        const cloned = new GridContainer(this._id);
        cloned.properties = this._properties.clone();
        this._items?.forEach(item => cloned.addItem(item.clone()));
        return cloned;
    }
}
