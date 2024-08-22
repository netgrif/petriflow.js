import {ArcType} from './arc-type.enum';
import {PlaceTransitionArc} from './place-transition-arc';

export class RegularPlaceTransitionArc extends PlaceTransitionArc {

    /**
     * Regular arc consumes number of tokens equal to its multiplicity.
     * @returns number of consumed tokens = multiplicity of arc
     * @throws Error if firing precondition is not fulfilled.
     */
    consume(): number {
        this.assertCanFire();
        const resolvedMultiplicity: number = this.resolveMultiplicity()
        this.source.marking -= resolvedMultiplicity;
        return resolvedMultiplicity;
    }

    /**
     * Regular arc enables transition to fire if the input place contains at
     * least as many tokens as the multiplicity of arc.
     * @returns true if place marking >= multiplicity, false otherwise
     */
    canFire(): boolean {
        return this.source.marking >= this.resolveMultiplicity();
    }

    get type(): ArcType {
        return ArcType.REGULAR_PT;
    }

    clone(): RegularPlaceTransitionArc {
        const cloned = new RegularPlaceTransitionArc(this.source, this.destination, this.id);
        super.cloneAttributes(cloned);
        return cloned;
    }
}
