import {ArcType} from './arc-type.enum';
import {PlaceTransitionArc} from './place-transition-arc';

export class ResetArc extends PlaceTransitionArc {

    /**
     * Reset arc consumes all tokens from the input place. Since reset arc does
     * not impose any precondition on firing, this function does not throw any
     * error.
     * @returns number of consumed tokens = number of tokens in input place.
     */
    consume(): number {
        const marking = this.source.marking;
        this.source.marking = 0;
        return marking;
    }

    /**
     * Reset arc does not impose a precondition on firing.
     * @returns always true
     */
    canFire(): boolean {
        return true;
    }

    get type(): ArcType {
        return ArcType.RESET;
    }

    clone(): ResetArc {
        const cloned = new ResetArc(this.source, this.destination, this.id);
        super.cloneAttributes(cloned);
        return cloned;
    }
}
