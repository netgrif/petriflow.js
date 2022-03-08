import {Place} from '../petrinet/place';
import {Transition} from '../transition/transition';
import {Arc} from './arc';

export abstract class PlaceTransitionArc extends Arc<Place, Transition> {

    abstract consume(): void;

    abstract canFire(): boolean;

    assertCanFire(): void {
        if (!this.canFire()) {
            throw new Error(`Firing precondition of arc ${this.id} is not fulfilled`);
        }
    }
}
