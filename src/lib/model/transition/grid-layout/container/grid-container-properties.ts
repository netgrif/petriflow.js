import {GridAlignContent} from './enums/grid-align-content.enum';
import {GridAlignItems} from './enums/grid-align-items.enum';
import {GridAutoFlow} from './enums/grid-auto-flow.enum';
import {GridDisplay} from './enums/grid-display.enum';
import {GridJustifyContent} from './enums/grid-justify-content.enum';
import {JustifyItems} from './enums/justify-items.enum';

export class GridContainerProperties {

    private _display: GridDisplay = GridDisplay.GRID;
    private _gridTemplateColumns?: string;
    private _gridTemplateRows?: string;
    private _gridTemplateAreas?: string;
    private _gridTemplate?: string;
    private _gridColumnGap?: string;
    private _gridRowGap?: string;
    private _rowGap?: string;
    private _columnGap?: string;
    private _gap?: string;
    private _gridGap?: string;
    private _justifyItems: JustifyItems = JustifyItems.STRETCH;
    private _alignItems: GridAlignItems = GridAlignItems.STRETCH;
    private _placeItems?: string;
    private _justifyContent: GridJustifyContent = GridJustifyContent.STRETCH;
    private _alignContent: GridAlignContent = GridAlignContent.START;
    private _placeContent?: string;
    private _gridAutoColumns?: string
    private _gridAutoRows?: string
    private _gridAutoFlow: GridAutoFlow = GridAutoFlow.ROW;
    private _grid?: string;


    get display(): GridDisplay {
        return this._display;
    }

    set display(value: GridDisplay) {
        this._display = value;
    }

    get gridTemplateColumns(): string | undefined {
        return this._gridTemplateColumns;
    }

    set gridTemplateColumns(value: string | undefined) {
        this._gridTemplateColumns = value;
    }

    get gridTemplateRows(): string | undefined {
        return this._gridTemplateRows;
    }

    set gridTemplateRows(value: string | undefined) {
        this._gridTemplateRows = value;
    }

    get gridTemplateAreas(): string | undefined {
        return this._gridTemplateAreas;
    }

    set gridTemplateAreas(value: string | undefined) {
        this._gridTemplateAreas = value;
    }

    get gridTemplate(): string | undefined {
        return this._gridTemplate;
    }

    set gridTemplate(value: string | undefined) {
        this._gridTemplate = value;
    }

    get gridColumnGap(): string | undefined {
        return this._gridColumnGap;
    }

    set gridColumnGap(value: string | undefined) {
        this._gridColumnGap = value;
    }

    get gridRowGap(): string | undefined {
        return this._gridRowGap;
    }

    set gridRowGap(value: string | undefined) {
        this._gridRowGap = value;
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

    get gap(): string | undefined{
        return this._gap;
    }

    set gap(value: string | undefined) {
        this._gap = value;
    }

    get gridGap(): string | undefined {
        return this._gridGap;
    }

    set gridGap(value: string | undefined) {
        this._gridGap = value;
    }

    get justifyItems(): JustifyItems {
        return this._justifyItems;
    }

    set justifyItems(value: JustifyItems) {
        this._justifyItems = value;
    }

    get alignItems(): GridAlignItems {
        return this._alignItems;
    }

    set alignItems(value: GridAlignItems) {
        this._alignItems = value;
    }

    get placeItems(): string | undefined {
        return this._placeItems;
    }

    set placeItems(value: string | undefined) {
        this._placeItems = value;
    }

    get justifyContent(): GridJustifyContent {
        return this._justifyContent;
    }

    set justifyContent(value: GridJustifyContent) {
        this._justifyContent = value;
    }

    get alignContent(): GridAlignContent {
        return this._alignContent;
    }

    set alignContent(value: GridAlignContent) {
        this._alignContent = value;
    }

    get placeContent(): string | undefined {
        return this._placeContent;
    }

    set placeContent(value: string | undefined) {
        this._placeContent = value;
    }

    get gridAutoColumns(): string | undefined {
        return this._gridAutoColumns;
    }

    set gridAutoColumns(value: string | undefined) {
        this._gridAutoColumns = value;
    }

    get gridAutoRows(): string | undefined {
        return this._gridAutoRows;
    }

    set gridAutoRows(value: string | undefined) {
        this._gridAutoRows = value;
    }

    get gridAutoFlow(): GridAutoFlow {
        return this._gridAutoFlow;
    }

    set gridAutoFlow(value: GridAutoFlow) {
        this._gridAutoFlow = value;
    }

    get grid(): string | undefined {
        return this._grid;
    }

    set grid(value: string | undefined) {
        this._grid = value;
    }

    public clone(): GridContainerProperties {
        const cloned = new GridContainerProperties();
        cloned.display = this._display;
        cloned.gridTemplateColumns = this._gridTemplateColumns;
        cloned.gridTemplateRows = this._gridTemplateRows;
        cloned.gridTemplateAreas = this._gridTemplateAreas;
        cloned.gridTemplate = this._gridTemplate;
        cloned.gridColumnGap = this._gridColumnGap;
        cloned.gridRowGap = this._gridRowGap;
        cloned.rowGap = this._rowGap;
        cloned.columnGap = this._columnGap;
        cloned.gap = this._gap;
        cloned.gridGap = this._gridGap;
        cloned.justifyItems = this._justifyItems;
        cloned.alignItems = this._alignItems;
        cloned.placeItems = this._placeItems;
        cloned.justifyContent = this._justifyContent;
        cloned.alignContent = this._alignContent;
        cloned.placeContent = this._placeContent;
        cloned.gridAutoColumns = this._gridAutoColumns;
        cloned.gridAutoRows = this._gridAutoRows
        cloned.gridAutoFlow = this._gridAutoFlow;
        cloned.grid = this._grid;
        return cloned;
    }
}
