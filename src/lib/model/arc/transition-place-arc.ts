import {Place} from '../petrinet/place';
import {Transition} from '../transition/transition';
import {Arc} from './arc';

export abstract class TransitionPlaceArc extends Arc<Transition, Place> {

    abstract produce(): void;

}
