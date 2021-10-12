import {Appearance} from './appearance.enum';
import {Layout} from './layout';
import {Template} from './template.enum';

export class DataLayout extends Layout {
    private _x: number;
    private _y: number;
    private _template: Template;
    private _appearance: Appearance;


    constructor(x = 0, y = 0, template = Template.MATERIAL, appearance = Appearance.STANDARD) {
        super();
        this._x = x;
        this._y = y;
        this._template = template;
        this._appearance = appearance;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get template(): Template {
        return this._template;
    }

    set template(value: Template) {
        this._template = value;
    }

    get appearance(): Appearance {
        return this._appearance;
    }

    set appearance(value: Appearance) {
        this._appearance = value;
    }

    public clone(): DataLayout {
        const cloned = new DataLayout();
        cloned._x = this._x;
        cloned._y = this._y;
        cloned.rows = this.rows;
        cloned.cols = this.cols;
        cloned._template = this._template;
        cloned._appearance = this._appearance;
        cloned.offset = this.offset;
        cloned.alignment = this?.alignment;
        return cloned;
    }
}
