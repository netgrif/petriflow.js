import {ArcType} from './arc-type.enum';
import {PlaceTransitionArc} from './place-transition-arc';

export class InhibitorArc extends PlaceTransitionArc {

    // TODO: documentation
    consume(): void {
        this.assertCanFire();
    }

    // TODO: documentation
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
