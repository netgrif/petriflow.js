import {CaseLogic} from './case-logic';
import {PermissionRef} from './permission-ref';

export class ProcessPermissionRef extends PermissionRef<CaseLogic> {

    constructor(id: string) {
        super(id, new CaseLogic());
    }

    public clone(): ProcessPermissionRef {
        const cloned = new ProcessPermissionRef(this.id);
        cloned.logic = this.logic?.clone();
        return cloned;
    }
}
