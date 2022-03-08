import {ArcType} from './arc-type.enum';
import {PlaceTransitionArc} from './place-transition-arc';

export class RegularPlaceTransitionArc extends PlaceTransitionArc {

    // TODO: documentation
    consume(): void {
        this.assertCanFire();
        this.source.marking -= this.multiplicity;
    }

    // TODO: documentation
    canFire(): boolean {
        return this.source.marking >= this.multiplicity;
    }

    get type(): ArcType {
        return ArcType.REGULAR;
    }

    clone(): RegularPlaceTransitionArc {
        const cloned = new RegularPlaceTransitionArc(this.source, this.destination, this.id);
        super.cloneAttributes(cloned);
        return cloned;
    }
}
