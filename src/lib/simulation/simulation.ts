import {
    Arc,
    ArcType,
    NodeElement,
    PetriNet,
    Place,
    PlaceTransitionArc,
    Transition,
    TransitionPlaceArc
} from '../model';

export class Simulation {

    static readonly ARC_ORDER = [
        ArcType.INHIBITOR,
        ArcType.READ,
        ArcType.REGULAR,
        ArcType.RESET
    ];
    private readonly originalModel: PetriNet;
    private _simulationModel: PetriNet;
    private dataVariables: Map<string, number>;
    private inputArcs: Map<string, Array<Arc<NodeElement, NodeElement>>>;
    private outputArcs: Map<string, Array<Arc<NodeElement, NodeElement>>>;
    private assignedTasks: Set<string>;
    private consumedTokens: Map<string, number>;

    constructor(model: PetriNet, dataVariables = new Map<string, number>()) {
        if (!model) {
            throw new Error('Model can not be undefined');
        }
        this._simulationModel = this.originalModel = model;
        this.dataVariables = dataVariables;
        // noinspection DuplicatedCode
        this.inputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this.outputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this.assignedTasks = new Set<string>();
        this.consumedTokens = new Map<string, number>();
        this.reset();
    }

    get simulationModel(): PetriNet {
        return this._simulationModel;
    }

    reset(): void {
        this._simulationModel = this.originalModel.clone();
        // noinspection DuplicatedCode
        this.inputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this.outputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this.assignedTasks = new Set<string>();
        this.consumedTokens = new Map<string, number>();
        const arcs = this._simulationModel.getArcs().sort(this.arcOrder);
        for (const arc of arcs) {
            this.updateIOArc(arc);
            this.updateDataReference(arc);
        }
    }

    updateData(dataVariables: Map<string, number>): void {
        this.dataVariables = dataVariables;
        this._simulationModel.getArcs().forEach(arc => this.updateDataReference(arc));
    }

    fire(transitionId: string): void {
        this.assign(transitionId);
        this.finish(transitionId);
    }

    assign(transitionId: string): void {
        if (!this.isEnabled(transitionId)) {
            throw new Error(`Transition ${transitionId} is not enabled to fire`);
        }
        if (this.isAssigned(transitionId)) {
            throw new Error(`Transition ${transitionId} is already assigned`);
        }
        const inputArcs = this.inputArcs.get(transitionId);
        inputArcs?.forEach(a => {
            const consumed = (a as PlaceTransitionArc).consume();
            this.consumedTokens.set(a.id, consumed);
        });
        this.assignedTasks.add(transitionId);
    }

    finish(transitionId: string): void {
        if (!this.isAssigned(transitionId)) {
            throw new Error(`Transition ${transitionId} is not assigned`);
        }
        const outputArcs = this.outputArcs.get(transitionId);
        outputArcs?.forEach(a => (a as TransitionPlaceArc).produce());
        this.assignedTasks.delete(transitionId);
    }

    cancel(transitionId: string): void {
        if (!this.isAssigned(transitionId)) {
            throw new Error(`Transition ${transitionId} is not assigned`);
        }
        const inputArcs = this.inputArcs.get(transitionId);
        inputArcs?.forEach(a => {
            const consumed = this.consumedTokens.get(a.id);
            this.consumedTokens.delete(a.id);
            if (consumed) {
                (a as PlaceTransitionArc).source.marking += consumed;
            }
        });
        this.assignedTasks.delete(transitionId);
    }

    isEnabled(transitionId: string): boolean {
        const inputArcs = this.inputArcs.get(transitionId);
        const originalMarking = new Map<Place, number>();
        this._simulationModel.getPlaces().forEach(p => originalMarking.set(p, p.marking));
        let result = true;
        try {

            inputArcs?.forEach(a => (a as PlaceTransitionArc).consume());
        } catch (ignored) {
            result = false;
        } finally {
            originalMarking.forEach((marking, place) => place.marking = marking);
        }
        return result
    }

    enabled(): Array<Transition> {
        return this._simulationModel.getTransitions().filter(t => this.isEnabled(t.id));
    }

    isAssigned(transitionId: string): boolean {
        return this.assignedTasks.has(transitionId);
    }

    assigned(): Array<Transition> {
        return this.simulationModel.getTransitions().filter(t => this.assignedTasks.has(t.id));
    }

    protected updateIOArc(arc: Arc<NodeElement, NodeElement>) {
        if (arc.destination instanceof Transition) {
            this.insertArc(this.inputArcs, arc, arc.destination.id);
        } else {
            this.insertArc(this.outputArcs, arc, arc.source.id);
        }
    }

    protected insertArc(arcs: Map<string, Array<Arc<NodeElement, NodeElement>>>, arc: Arc<NodeElement, NodeElement>, id: string) {
        if (!arcs.has(id)) {
            arcs.set(id, new Array<Arc<NodeElement, NodeElement>>());
        }
        arcs.get(id)?.push(arc);
    }

    protected updateDataReference(arc: Arc<NodeElement, NodeElement>) {
        if (arc.reference && this.dataVariables.has(arc.reference)) {
            const value = this.dataVariables.get(arc.reference);
            if (value) {
                arc.multiplicity = value;
            }
        }
    }

    protected arcOrder(a: Arc<NodeElement, NodeElement>, b: Arc<NodeElement, NodeElement>): number {
        return Simulation.ARC_ORDER.indexOf(a.type) - Simulation.ARC_ORDER.indexOf(b.type);
    }
}
