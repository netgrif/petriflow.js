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
    private expressionMapping: Map<string, string>;

    constructor(model: PetriNet, dataVariables = new Map<string, number>()) {
        super(model);
        this.expressionMapping = new Map<string, string>();
        this.dataVariables = dataVariables;
        this.reset();
    }

    reset(): void {
        super.reset();
        const arcs = this.simulationModel.getArcs().sort(this.arcOrder);
        for (const arc of arcs) {
            this.updateIOArc(arc);
            this.updateExpressionMapping(arc);
        }
        this.updateReferences();
        this.updateReferences();
    }

    updateData(dataVariables: Map<string, number>): void {
        this.dataVariables = dataVariables;
        this.updateReferences();
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
        this.updateReferences();
    }

    finish(transitionId: string): void {
        if (!this.isAssigned(transitionId)) {
            throw new Error(`Transition ${transitionId} is not assigned`);
        }
        const outputArcs = this.outputArcs.get(transitionId);
        outputArcs?.forEach(a => (a as TransitionPlaceArc).produce());
        this.assignedTasks.delete(transitionId);
        this.updateReferences();
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
        this.updateReferences();
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

    protected updateIOArc(arc: Arc<NodeElement, NodeElement>): void {
        if (arc.destination instanceof Transition) {
            this.insertArc(this.inputArcs, arc, arc.destination.id);
        } else {
            this.insertArc(this.outputArcs, arc, arc.source.id);
        }
    }

    protected insertArc(arcs: Map<string, Array<Arc<NodeElement, NodeElement>>>, arc: Arc<NodeElement, NodeElement>, id: string): void {
        if (!arcs.has(id)) {
            arcs.set(id, new Array<Arc<NodeElement, NodeElement>>());
        }
        arcs.get(id)?.push(arc);
    }

    protected arcOrder(a: Arc<NodeElement, NodeElement>, b: Arc<NodeElement, NodeElement>): number {
        return BasicSimulation.ARC_ORDER.indexOf(a.type) - BasicSimulation.ARC_ORDER.indexOf(b.type);
    }

    updateReferences(): void {
        this.updateReference(expression => `${this.dataVariables.get(expression)}`);
    }

    updateReference(evaluate: (expression: string) => string): void {
        this.simulationModel.getArcs().filter(arc => !arc.multiplicity.dynamic)
            .forEach(arc => {
                const arcExpression: string | undefined = this.expressionMapping.get(arc.id)
                if (arcExpression === undefined) {
                    return;
                }
                const multiplicity = evaluate(arcExpression);
                if(multiplicity === 'undefined') {
                    return;
                }
                arc.multiplicity.expression = multiplicity;
            });
    }

    updateExpressionMapping(arc: Arc<NodeElement, NodeElement>): void {
        if (!this.expressionMapping.has(arc.id)) {
            this.expressionMapping.set(arc.id, arc.multiplicity.expression);
        }
    }
}
