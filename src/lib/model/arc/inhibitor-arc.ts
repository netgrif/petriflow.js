import {ArcType} from './arc-type.enum';
import {PlaceTransitionArc} from './place-transition-arc';

export class InhibitorArc extends PlaceTransitionArc {

    /**
     * Inhibitor arc does not consume any tokens from input place.
     * @returns always 0
     * @throws Error if firing precondition is not fulfilled.
     */
    consume(): number {
        this.assertCanFire();
        return 0;
    }

    /**
     * Inhibitor arc enables transition to fire if the input place contains fewer
     * tokens than the multiplicity of arc.
     * @returns true if place marking < multiplicity, false otherwise
     */
    canFire(): boolean {
        return this.source.marking < this.multiplicity;
    }

    get type(): ArcType {
        return ArcType.INHIBITOR;
    }

    clone(): InhibitorArc {
        const cloned = new InhibitorArc(this.source, this.destination, this.id);
        super.cloneAttributes(cloned);
        return cloned;
    }
}
