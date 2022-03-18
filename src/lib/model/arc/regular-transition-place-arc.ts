import {ArcType} from './arc-type.enum';
import {TransitionPlaceArc} from './transition-place-arc';

export class RegularTransitionPlaceArc extends TransitionPlaceArc {

    /**
     * Regular arc produces number of tokens equal to its multiplicity.
     */
    produce(): void {
        this.destination.marking += this.multiplicity;
    }

    get type(): ArcType {
        return ArcType.REGULAR;
    }

    clone(): RegularTransitionPlaceArc {
        const cloned = new RegularTransitionPlaceArc(this.source, this.destination, this.id);
        super.cloneAttributes(cloned);
        return cloned;
    }
}
