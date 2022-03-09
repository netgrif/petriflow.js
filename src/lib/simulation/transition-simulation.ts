import {PetriNet, Place, PlaceTransitionArc, Transition} from '../model';

export class TransitionSimulation {

    private model: PetriNet;

    constructor(model: PetriNet) {
        this.model = model;
    }

    fire(transitionId: string): void {
        if (!this.isEnabled(transitionId)) {
            throw new Error(`Transition ${transitionId} is not enabled to fire`);
        }
        const transition = this.getTransition(transitionId);
        const inputArcs = this.model.getArcs().filter(a => a.destination === transition);
        inputArcs.forEach(a => (a as PlaceTransitionArc).consume());
    }

    isEnabled(transitionId: string): boolean {
        const transition = this.getTransition(transitionId);
        const inputArcs = this.model.getArcs().filter(a => a.destination === transition);
        const originalMarking = new Map<Place, number>();
        this.model.getPlaces().forEach(p => originalMarking.set(p, p.marking));
        let result;
        try {
            inputArcs.forEach(a => (a as PlaceTransitionArc).consume());
            result = true;
        } catch (ignored) {
            result = false;
        } finally {
            originalMarking.forEach((marking, place) => place.marking = marking);
        }
        return result
    }

    enabled(): Array<Transition> {
        return this.model.getTransitions().filter(t => this.isEnabled(t.id));
    }

    private getTransition(transitionId: string): Transition | never {
        const transition = this.model.getTransition(transitionId);
        if (transition === undefined) {
            throw new Error(`Transition with id ${transitionId} does not exist`);
        }
        return transition;
    }
}
