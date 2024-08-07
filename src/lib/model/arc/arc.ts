import {Expression} from '../data-variable/expression';
import {Element} from '../petrinet/element';
import {FunctionScope} from '../petrinet/function-scope.enum';
import {NodeElement} from '../petrinet/node-element';
import {ArcType, XmlArcType} from './arc-type.enum';
import {Breakpoint} from './breakpoint';

export abstract class Arc<S extends NodeElement, D extends NodeElement> extends Element {
    private _source: S;
    private _destination: D;
    private _multiplicity: Expression;
    private _breakpoints: Array<Breakpoint>;
    private _scope: FunctionScope = FunctionScope.USECASE;

    constructor(source: S, target: D, id: string) {
        super(id);
        this._source = source;
        this._destination = target;
        this._multiplicity = new Expression('1', false);
        this._breakpoints = [];
    }

    public static arcTypeMapping: Map<ArcType, XmlArcType> = new Map([
        [ArcType.REGULAR_TP, XmlArcType.REGULAR],
        [ArcType.REGULAR_PT, XmlArcType.REGULAR],
        [ArcType.READ, XmlArcType.READ],
        [ArcType.RESET, XmlArcType.RESET],
        [ArcType.INHIBITOR, XmlArcType.INHIBITOR],
    ]);

    abstract get type(): ArcType;

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

    get multiplicity(): Expression {
        return this._multiplicity;
    }

    set multiplicity(value: Expression) {
        this._multiplicity = value;
    }

    get breakpoints(): Array<Breakpoint> {
        return this._breakpoints;
    }

    set breakpoints(value: Array<Breakpoint>) {
        this._breakpoints = value;
    }

    get scope(): FunctionScope {
        return this._scope;
    }

    set scope(value: FunctionScope) {
        this._scope = value;
    }

    cloneAttributes(cloned: Arc<S, D>): void {
        cloned._multiplicity = this._multiplicity;
        cloned._breakpoints = this._breakpoints?.map(bp => bp.clone());
        cloned._scope = this._scope;
    }

    abstract clone(): Arc<S, D>;

    resolveMultiplicity(): number {
        const resolvedMultiplicity: number = Number.parseInt(this.multiplicity.expression)
        if (isNaN(resolvedMultiplicity)) {
            throw new Error(`Cannot resolve multiplicity of arc: ${this.id}`);
        }
        return resolvedMultiplicity;
    }
}
