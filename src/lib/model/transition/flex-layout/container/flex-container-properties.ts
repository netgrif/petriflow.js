import {FlexAlignContent} from './enums/flex-align-content.enum';
import {FlexAlignItems} from './enums/flex-align-items.enum';
import {FlexDirection} from './enums/flex-direction.enum';
import {FlexDisplay} from './enums/flex-display.enum';
import {FlexJustifyContent} from './enums/flex-justify-content.enum';
import {FlexWrap} from './enums/flex-wrap.enum';

export class FlexContainerProperties {

    private _display: FlexDisplay = FlexDisplay.FLEX;
    private _flexDirection: FlexDirection = FlexDirection.ROW;
    private _flexWrap: FlexWrap = FlexWrap.NOWRAP;
    private _flexFlow?: string;
    private _justifyContent: FlexJustifyContent = FlexJustifyContent.FLEX_START;
    private _alignItems: FlexAlignItems = FlexAlignItems.STRETCH;
    private _alignContent: FlexAlignContent = FlexAlignContent.NORMAL;
    private _gap?: string;
    private _rowGap?: string;
    private _columnGap?: string;

    get display(): FlexDisplay {
        return this._display;
    }

    set display(value: FlexDisplay) {
        this._display = value;
    }

    get flexDirection(): FlexDirection {
        return this._flexDirection;
    }

    set flexDirection(value: FlexDirection) {
        this._flexDirection = value;
    }

    get flexWrap(): FlexWrap {
        return this._flexWrap;
    }

    set flexWrap(value: FlexWrap) {
        this._flexWrap = value;
    }

    get flexFlow(): string | undefined {
        return this._flexFlow;
    }

    set flexFlow(value: string | undefined) {
        this._flexFlow = value;
    }

    get justifyContent(): FlexJustifyContent {
        return this._justifyContent;
    }

    set justifyContent(value: FlexJustifyContent) {
        this._justifyContent = value;
    }

    get alignItems(): FlexAlignItems {
        return this._alignItems;
    }

    set alignItems(value: FlexAlignItems) {
        this._alignItems = value;
    }

    get alignContent(): FlexAlignContent {
        return this._alignContent;
    }

    set alignContent(value: FlexAlignContent) {
        this._alignContent = value;
    }

    get gap(): string | undefined {
        return this._gap;
    }

    set gap(value: string | undefined) {
        this._gap = value;
    }

    get rowGap(): string | undefined {
        return this._rowGap;
    }

    set rowGap(value: string | undefined) {
        this._rowGap = value;
    }

    get columnGap(): string | undefined {
        return this._columnGap;
    }

    set columnGap(value: string | undefined) {
        this._columnGap = value;
    }

    public clone(): FlexContainerProperties {
        const cloned = new FlexContainerProperties();
        cloned.display = this._display;
        cloned.flexDirection = this._flexDirection;
        cloned.flexWrap = this._flexWrap;
        cloned.flexFlow = this._flexFlow;
        cloned.justifyContent = this._justifyContent;
        cloned.alignItems = this._alignItems;
        cloned.alignContent = this._alignContent;
        cloned.gap = this._gap;
        cloned.rowGap = this._rowGap;
        cloned.columnGap = this._columnGap;
        return cloned;
    }
}
