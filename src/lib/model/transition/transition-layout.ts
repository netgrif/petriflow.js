import {CompactDirection} from './compact-direction.enum';
import {HideEmptyRows} from './hide-empty-rows.enum';
import {Layout} from './layout';
import {LayoutType} from './layout-type.enum';

export class TransitionLayout extends Layout {
    private _type?: LayoutType;
    private _hideEmptyRows?: HideEmptyRows;
    private _compactDirection?: CompactDirection;

    get type(): LayoutType | undefined {
        return this._type;
    }

    set type(value: LayoutType | undefined) {
        this._type = value;
    }

    get hideEmptyRows(): HideEmptyRows | undefined {
        return this._hideEmptyRows;
    }

    set hideEmptyRows(value: HideEmptyRows | undefined) {
        this._hideEmptyRows = value;
    }

    get compactDirection(): CompactDirection | undefined {
        return this._compactDirection;
    }

    set compactDirection(value: CompactDirection | undefined) {
        this._compactDirection = value;
    }

    public empty(): boolean {
        return this.cols === undefined && this.rows === undefined && this.offset === undefined &&
            this.alignment === undefined && this._type === undefined;
    }

    public clone(): TransitionLayout {
        const cloned = new TransitionLayout();
        cloned.rows = this.rows;
        cloned.cols = this.cols;
        cloned.offset = this.offset;
        cloned.alignment = this.alignment;
        cloned.hideEmptyRows = this.hideEmptyRows;
        cloned.compactDirection = this.compactDirection;
        cloned.type = this._type;
        return cloned;
    }
}
