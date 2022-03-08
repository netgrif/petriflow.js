import {ArcType} from './arc-type.enum';
import {PlaceTransitionArc} from './place-transition-arc';

export class ResetArc extends PlaceTransitionArc {

    /**
     * Reset arc consumes all tokens in place.
     */
    consume(): void {
        this.assertCanFire();
        this.source.marking = 0;
    }

    /**
     * Reset arc does not impose a precondition on firing.
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
