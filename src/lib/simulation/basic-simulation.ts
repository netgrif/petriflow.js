import {
    Arc,
    NodeElement,
    PetriNet,
    Place,
    PlaceTransitionArc,
    Transition,
    TransitionPlaceArc
} from '../model';
import {Simulation} from "./simulation";

export class BasicSimulation extends Simulation {

    private dataVariables: Map<string, number>;

    constructor(model: PetriNet, dataVariables = new Map<string, number>()) {
        super(model);
        this.dataVariables = dataVariables;
        this.reset();
    }

    reset(): void {
        super.reset();
        const arcs = this.simulationModel.getArcs().sort(this.arcOrder);
        for (const arc of arcs) {
            this.updateIOArc(arc);
            this.updateDataReference(arc);
        }
    }

    updateData(dataVariables: Map<string, number>): void {
        this.dataVariables = dataVariables;
        this.simulationModel.getArcs().forEach(arc => this.updateDataReference(arc));
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
        this.simulationModel.getPlaces().forEach(p => originalMarking.set(p, p.marking));
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
        return this.simulationModel.getTransitions().filter(t => this.isEnabled(t.id));
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
        return BasicSimulation.ARC_ORDER.indexOf(a.type) - BasicSimulation.ARC_ORDER.indexOf(b.type);
    }
}
