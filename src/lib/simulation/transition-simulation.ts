import {
    Arc,
    NodeElement,
    PetriNet,
    Place,
    PlaceTransitionArc,
    Transition,
    TransitionPlaceArc
} from '../model';

export class TransitionSimulation {

    private readonly originalModel: PetriNet;
    private _simulationModel: PetriNet;
    private dataVariables: Map<string, number>;
    private inputArcs: Map<string, Array<Arc<NodeElement, NodeElement>>>;
    private outputArcs: Map<string, Array<Arc<NodeElement, NodeElement>>>;

    constructor(model: PetriNet, dataVariables = new Map<string, number>()) {
        if (!model) {
            throw new Error('Model can not be undefined');
        }
        this._simulationModel = this.originalModel = model;
        this.dataVariables = dataVariables;
        this.inputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this.outputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this.reset();
    }

    get simulationModel(): PetriNet {
        return this._simulationModel;
    }

    reset(): void {
        this._simulationModel = this.originalModel.clone();
        this.inputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        this.outputArcs = new Map<string, Array<Arc<NodeElement, NodeElement>>>();
        for (const arc of this._simulationModel.getArcs()) {
            this.updateIOArc(arc);
            this.updateDataReference(arc);
        }
    }

    updateData(dataVariables: Map<string, number>): void {
        this.dataVariables = dataVariables;
        this._simulationModel.getArcs().forEach(arc => this.updateDataReference(arc));
    }

    fire(transitionId: string): void {
        if (!this.isEnabled(transitionId)) {
            throw new Error(`Transition ${transitionId} is not enabled to fire`);
        }
        const inputArcs = this.inputArcs.get(transitionId);
        inputArcs?.forEach(a => (a as PlaceTransitionArc).consume());
        const outputArcs = this.outputArcs.get(transitionId);
        outputArcs?.forEach(a => (a as TransitionPlaceArc).produce());
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

    private updateIOArc(arc: Arc<NodeElement, NodeElement>) {
        if (arc.destination instanceof Transition) {
            this.insertArc(this.inputArcs, arc);
        } else {
            this.insertArc(this.outputArcs, arc);
        }
    }

    private insertArc(arcs: Map<string, Array<Arc<NodeElement, NodeElement>>>, arc: Arc<NodeElement, NodeElement>) {
        if (!arcs.has(arc.destination.id)) {
            arcs.set(arc.destination.id, new Array<Arc<NodeElement, NodeElement>>());
        }
        arcs.get(arc.destination.id)?.push(arc);
    }

    private updateDataReference(arc: Arc<NodeElement, NodeElement>) {
        if (arc.reference && this.dataVariables.has(arc.reference)) {
            const value = this.dataVariables.get(arc.reference);
            if (value) {
                arc.multiplicity = value;
            }
        }
    }
}
