import {ArcType} from './arc-type.enum';
import {PlaceTransitionArc} from './place-transition-arc';

export class ReadArc extends PlaceTransitionArc {

    /**
     * Read arc does not consume any tokens from input place.
     * @returns always 0
     * @throws Error if firing precondition is not fulfilled.
     */
    consume(): number {
        this.assertCanFire();
        return 0;
    }

    /**
     * Read arc enables transition to fire if the input place contains at least as
     * many tokens as the multiplicity of arc.
     * @returns true if place marking >= multiplicity, false otherwise
     */
    canFire(): boolean {
        return this.source.marking >= this.resolveMultiplicity();
    }

    get type(): ArcType {
        return ArcType.READ;
    }

    clone(): ReadArc {
        const cloned = new ReadArc(this.source, this.destination, this.id);
        super.cloneAttributes(cloned);
        return cloned;
    }
}
