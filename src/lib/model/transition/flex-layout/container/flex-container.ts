import {FlexItem} from '../item/flex-item';
import {FlexContainerProperties} from './flex-container-properties';

export class FlexContainer {

    private _id: string;
    private _items?: Array<FlexItem>;
    private _properties: FlexContainerProperties;

    constructor(id: string) {
        this._id = id;
        this._properties = new FlexContainerProperties();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get items(): Array<FlexItem> | undefined {
        return this._items;
    }

    set items(value: Array<FlexItem> | undefined ) {
        this._items = value;
    }

    get properties(): FlexContainerProperties {
        return this._properties;
    }

    set properties(value: FlexContainerProperties) {
        this._properties = value;
    }

    addItem(item: FlexItem) {
        if (this._items === undefined) {
            this._items = [];
        }
        this._items.push(item);
    }

    getItemById(itemId: string): FlexItem | undefined {
        return this._items?.filter(item => item.getContentId() === itemId)[0];
    }

    public clone(): FlexContainer {
        const cloned = new FlexContainer(this.id);
        this.items?.forEach(item => cloned.addItem(item.clone()));
        cloned.properties = this._properties.clone();
        return cloned;
    }
}
