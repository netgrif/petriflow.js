export class IdentifierBlacklist {

    private static readonly _identifierKeywords: Set<string> = new Set<string>(['abstract','assert','boolean','break','byte','case','catch','char','class','const','continue','default','double','do','else','enum','extends','false','final','finally','float','for','goto','if','implements','import','instanceof','int','interface','long','native','new','null','package','private','protected','public','return','short','static','strictfp','super','switch','synchronized','this','throw','throws','transient','true','try','void','volatile','while','_']);

    static get identifierKeywords(): Set<string> {
        return this._identifierKeywords;
    }
}
