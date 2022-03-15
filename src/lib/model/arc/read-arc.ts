import {ArcType} from './arc-type.enum';
import {PlaceTransitionArc} from './place-transition-arc';

export class ReadArc extends PlaceTransitionArc {

    // TODO: documentation
    consume(): number {
        this.assertCanFire();
        return 0;
    }

    // TODO: documentation
    canFire(): boolean {
        return this.source.marking >= this.multiplicity;
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
