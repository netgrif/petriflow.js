import {DataRefBehavior} from './data-ref-behavior.enum';

export class DataRefLogicUtil {

    // TODO: lambda not supported
    // private static _behaviors = Object.values(DataRefBehavior).filter(b => b !== DataRefBehavior.REQUIRED && b !== DataRefBehavior.OPTIONAL);

    public static behaviors(): Array<DataRefBehavior> {
        return [
            DataRefBehavior.HIDDEN,
            DataRefBehavior.FORBIDDEN,
            DataRefBehavior.VISIBLE,
            DataRefBehavior.EDITABLE
        ];
    }
}
