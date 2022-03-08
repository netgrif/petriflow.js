import {NodeElement} from '../petrinet/node-element';
import {ArcType} from './arc-type.enum';
import {Breakpoint} from './breakpoint';

export abstract class Arc<S extends NodeElement, D extends NodeElement> {
    private _id: string;
    private _source: S;
    private _destination: D;
    private _multiplicity: number;
    private _reference?: string;
    private _breakpoints: Array<Breakpoint>;

    constructor(source: S, target: D, id: string) {
        this._id = id;
        this._source = source;
        this._destination = target;
        this._multiplicity = 1;
        this._breakpoints = [];
    }

    abstract get type(): ArcType;

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get source(): S {
        return this._source;
    }

    set source(value: S) {
        this._source = value;
    }

    get destination(): D {
        return this._destination;
    }

    set destination(value: D) {
        this._destination = value;
    }

    get multiplicity(): number {
        return this._multiplicity;
    }

    set multiplicity(value: number) {
        this._multiplicity = value;
    }

    get reference(): string | undefined {
        return this._reference;
    }

    set reference(value: string | undefined) {
        this._reference = value;
    }

    get breakpoints(): Array<Breakpoint> {
        return this._breakpoints;
    }

    set breakpoints(value: Array<Breakpoint>) {
        this._breakpoints = value;
    }

    cloneAttributes(cloned: Arc<S, D>): void {
        cloned._multiplicity = this._multiplicity;
        cloned._reference = this._reference;
        cloned._breakpoints = this._breakpoints?.map(bp => bp.clone());
    }

    abstract clone(): Arc<S, D>;
}
