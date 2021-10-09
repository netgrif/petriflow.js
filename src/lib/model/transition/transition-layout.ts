import {LayoutType} from './layout-type.enum';
import {Layout} from './layout';

export class TransitionLayout extends Layout {
    private _type?: LayoutType;

    get type(): LayoutType {
        return this._type;
    }

    set type(value: LayoutType) {
        this._type = value;
    }

    public empty(): boolean {
        return this.cols === undefined && this.rows === undefined && this.offset === undefined &&
            this.alignment === undefined && this._type === undefined;
    }

    public clone(): TransitionLayout {
        const cloned = new TransitionLayout();
        cloned.cols = this.cols;
        cloned.rows = this.rows;
        cloned.offset = this.offset;
        cloned.alignment = this.alignment;
        cloned.type = this._type;
        return cloned;
    }
}
