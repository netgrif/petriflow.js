import {Layout} from './layout';
import {LayoutType} from './layout-type.enum';

export class TransitionLayout extends Layout {
    private _type?: LayoutType;

    get type(): LayoutType | undefined {
        return this._type;
    }

    set type(value: LayoutType | undefined) {
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
