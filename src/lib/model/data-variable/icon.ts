import {IconType} from './icon-type.enum';

export class Icon {
    private _key: string;
    private _icon: string;
    private _type: IconType;

    constructor(key: string, icon: string, type = IconType.MATERIAL) {
        this._key = key;
        this._icon = icon;
        this._type = type;
    }

    get key(): string {
        return this._key;
    }

    set key(value: string) {
        this._key = value;
    }

    get icon(): string {
        return this._icon;
    }

    set icon(value: string) {
        this._icon = value;
    }

    get type(): IconType {
        return this._type;
    }

    set type(value: IconType) {
        this._type = value;
    }

    public clone(): Icon {
        return new Icon(this._key, this._icon, this._type);
    }
}
