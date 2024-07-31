import {DataRef} from './data-ref';
import {FlexContainer} from './flex-layout/container/flex-container';
import {GridContainer} from './grid-layout/container/grid-container';

export abstract class AbstractLayoutItem {

    private _dataRef?: DataRef;
    private _flex?: FlexContainer;
    private _grid?: GridContainer;


    get dataRef(): DataRef | undefined {
        return this._dataRef;
    }

    set dataRef(value: DataRef | undefined) {
        this._dataRef = value;
    }

    get flex(): FlexContainer | undefined {
        return this._flex;
    }

    set flex(value: FlexContainer | undefined) {
        this._flex = value;
    }

    get grid(): GridContainer | undefined {
        return this._grid;
    }

    set grid(value: GridContainer | undefined) {
        this._grid = value;
    }

    getContentId(): string | undefined {
        if (this.dataRef) {
            return this.dataRef.id;
        }
        if (this.flex) {
            return this.flex.id;
        }
        if (this.grid) {
            return this.grid.id;
        }
        return undefined;
    }

}
