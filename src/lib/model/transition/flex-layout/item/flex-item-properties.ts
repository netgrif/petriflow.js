import {FlexItemAlignSelf} from './enums/flex-item-align-self.enum';

export class FlexItemProperties {
    private _order = 0;
    private _flexGrow = 0;
    private _flexShrink = 1;
    private _flexBasis = 'auto';
    private _flex?: string;
    private _alignSelf: FlexItemAlignSelf = FlexItemAlignSelf.AUTO;


    get order(): number {
        return this._order;
    }

    set order(value: number) {
        this._order = value;
    }

    get flexGrow(): number {
        return this._flexGrow;
    }

    set flexGrow(value: number) {
        this._flexGrow = value;
    }

    get flexShrink(): number {
        return this._flexShrink;
    }

    set flexShrink(value: number) {
        this._flexShrink = value;
    }

    get flexBasis(): string {
        return this._flexBasis;
    }

    set flexBasis(value: string) {
        this._flexBasis = value;
    }

    get flex(): string | undefined {
        return this._flex;
    }

    set flex(value: string | undefined) {
        this._flex = value;
    }

    get alignSelf(): FlexItemAlignSelf {
        return this._alignSelf;
    }

    set alignSelf(value: FlexItemAlignSelf) {
        this._alignSelf = value;
    }

    public clone(): FlexItemProperties {
        const cloned = new FlexItemProperties();
        cloned._order = this._order;
        cloned._flex = this._flex;
        cloned._flexGrow = this._flexGrow;
        cloned._flexShrink = this._flexShrink;
        cloned._flexBasis = this._flexBasis;
        cloned._alignSelf = this._alignSelf;
        return cloned;
    }
}
