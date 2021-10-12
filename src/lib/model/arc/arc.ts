import {ArcType} from './arc-type.enum';
import {Breakpoint} from './breakpoint';

export class Arc {
    private _id: string;
    private _type: ArcType;
    private _source: string;
    private _destination: string;
    private _multiplicity: number;
    private _reference?: string;
    private _breakpoints: Array<Breakpoint>;

    constructor(source: string, target: string, type: ArcType, id: string) {
        this._type = type;
        this._id = id;
        this._source = source;
        this._destination = target;
        this._multiplicity = 1;
        this._breakpoints = [];
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get type(): ArcType {
        return this._type;
    }

    set type(value: ArcType) {
        this._type = value;
    }

    get source(): string {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
    }

    get destination(): string {
        return this._destination;
    }

    set destination(value: string) {
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

    clone(): Arc {
        const arc = new Arc(this._source, this._destination, this._type, this._id);
        arc._multiplicity = this._multiplicity;
        arc._reference = this._reference;
        arc._breakpoints = [...this._breakpoints];
        return arc;
    }
}
