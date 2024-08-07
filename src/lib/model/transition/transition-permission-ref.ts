import {PermissionRef} from '../petrinet/permission-ref';
import {Logic} from './logic';

export class TransitionPermissionRef extends PermissionRef<Logic> {

    constructor(id: string) {
        super(id, new Logic());
    }

    public clone(): TransitionPermissionRef {
        const cloned = new TransitionPermissionRef(this.id);
        cloned.logic = this.logic?.clone();
        return cloned;
    }
}
