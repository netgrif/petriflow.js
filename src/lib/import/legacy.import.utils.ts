// noinspection DuplicatedCode

import {
    Action,
    Arc,
    Component,
    DataEvent,
    DataEventType,
    DataRef, DataRefBehavior,
    DataVariable,
    Event,
    EventPhase,
    Expression,
    FlexItem,
    I18nString,
    I18nWithDynamic,
    NodeElement,
    PetriflowFunction,
    Place,
    ProcessPermissionRef,
    ResourceScope, Role,
    TransitionPermissionRef,
    Trigger,
    TriggerType,
    XmlArcType
} from '../model';
import {PetriNetResult} from './petri-net-result';

export class LegacyImportUtils {

    private eventIdCounter = 0;
    private actionIdCounter = 0;
    private readonly actionWithDeclarationRegex = /([\W\w\s]*\w*:\s*[ft].\w+);([\w\W\s]*)/g;
    private readonly declarationRegex = /([\W\w\s]*\w*:\s*[ft].\w+);/g;

    public tagValue(xmlTag: Element | Document | null, child: string): string {
        if (!xmlTag || xmlTag.getElementsByTagName(child).length === 0 || xmlTag.getElementsByTagName(child)[0].childNodes.length === 0) {
            return '';
        }
        const parentNodeName = xmlTag.nodeName === '#document' ? 'document' : xmlTag.nodeName;
        const tags: Element[] = Array.from(xmlTag.getElementsByTagName(child)).filter(tag => tag?.parentNode?.nodeName === parentNodeName);
        if (tags === undefined || tags.length === 0 || tags[0]?.childNodes.length === 0) {
            return '';
        }
        return tags[0]?.childNodes[0]?.nodeValue ?? '';
    }

    public parseI18n(xmlTag: Element | Document, child: string): I18nString {
        const i18n = new I18nString(this.tagValue(xmlTag, child));
        if (i18n.value !== '') {
            const name = xmlTag.getElementsByTagName(child)[0].getAttribute('name');
            i18n.id = name === null ? undefined : name;
        }
        return i18n;
    }

    public parseI18nWithDynamic(xmlTag: Element | Document, child: string): I18nWithDynamic {
        const i18n = new I18nWithDynamic(this.removeExcessiveIndents(this.tagValue(xmlTag, child)));
        if (i18n.value !== '') {
            const name = xmlTag.getElementsByTagName(child)[0].getAttribute('name');
            i18n.id = name === null ? undefined : name;
            i18n.dynamic = xmlTag.getElementsByTagName(child)[0].getAttribute('dynamic') === 'true';
        }
        return i18n;
    }

    public tagAttribute(xmlTag: Element | null, attribute: string): string {
        if (!xmlTag) {
            return '';
        }
        let attr;
        for (let i = 0; i < xmlTag.attributes.length; i++) {
            if (xmlTag.attributes.item(i)?.name === attribute) {
                attr = xmlTag.attributes.item(i);
                break;
            }
        }
        if (!attr) {
            return '';
        }
        return attr.value;
    }

    public parseAction(actionTag: Element, thisId: string | undefined = undefined): Action {
        const actionId = actionTag.getAttribute('id') ?? 'action_' + this.getNextActionId();
        let definition = this.parseDefinition(actionTag);
        if (definition.match(this.actionWithDeclarationRegex) !== null) {
            let newDefinition = definition.replace(this.declarationRegex, '');
            const declaration = definition.match(this.declarationRegex);
            if (declaration) {
                const lines = declaration[0].substring(0, declaration[0].length - 1).split(',');
                for (const line of lines) {
                    const split = line.split(':');
                    const name = split[0].trim();
                    let id = split[1].trim().replace(/[ft]./, '');
                    if (id === 'this' && thisId) {
                        id = thisId;
                    }
                    newDefinition = newDefinition.replace(new RegExp(name), id);
                }
            }
            definition = newDefinition;
        }
        return new Action(actionId, definition.trim());
    }

    parseFunction(xmlFunction: Element) {
        const name = this.tagAttribute(xmlFunction, 'name');
        const scope = this.tagAttribute(xmlFunction, 'scope') as ResourceScope;
        const definition = this.parseDefinition(xmlFunction);
        return new PetriflowFunction(name, scope, definition);
    }

    public parseDefinition(tag: Element) {
        let definition = '';
        for (const node of Array.from(tag.childNodes)) {
            if (node.nodeName === '#comment') {
                if (!node.nodeValue || node.nodeValue.includes('@formatter')) {
                    continue;
                }
                definition += '<!--' + node.nodeValue + '-->';
            } else {
                definition += node.nodeValue;
            }
        }
        return this.removeExcessiveIndents(definition);
    }

    public removeExcessiveIndents(action: string): string {
        const lines = action.split('\n')
            .filter(line => line.trim().length !== 0);
        let commonIndent = Math.min(...(lines.map(l => l.length - l.trimStart().length)));
        if (isNaN(commonIndent) || !isFinite(commonIndent)) {
            commonIndent = 0;
        }
        return lines.map(line => line.substring(commonIndent)).join('\n');
    }

    public parseEncryption(xmlTag: Element): string | undefined {
        const encryption = this.tagValue(xmlTag, 'encryption');
        if (!encryption || encryption !== 'true') {
            return undefined;
        }
        const algorithm = xmlTag.getElementsByTagName('encryption')[0].getAttribute('algorithm');
        if (typeof algorithm === 'string' && algorithm !== '') {
            return algorithm;
        }
        return encryption;
    }

    public parseViewAndComponent(xmlTag: Element): Component | undefined {
        const xmlComponent = xmlTag.getElementsByTagName('component')[0];
        if (!xmlComponent?.children || xmlComponent.children.length === 0) {
            const xmlViewTag = xmlTag.getElementsByTagName('view')[0];
            if (!xmlViewTag?.children || xmlViewTag.children.length === 0) {
                return undefined;
            }
            // TODO: <view><list>5</list></view>
            return new Component(xmlViewTag.children[0].nodeName);
        }
        return this.parseComponent(xmlTag);
    }

    public parseComponent(xmlTag: Element): Component | undefined {
        const xmlComponent = xmlTag.getElementsByTagName('component')[0];
        if (!xmlComponent?.children || xmlComponent.children.length === 0) {
            return undefined;
        }
        const comp = new Component(this.tagValue(xmlComponent, 'name'));
        const properties = xmlComponent.getElementsByTagName('properties')[0];
        if (properties?.children && properties.children.length > 0) {
            for (const prop of Array.from(properties.getElementsByTagName('property'))) {
                this.parseProperty(prop, comp.properties);
            }
            const icons = properties.getElementsByTagName('option_icons').item(0);
            if (icons?.children && icons.children.length > 0) {
                for (const iconXml of Array.from(icons.getElementsByTagName('icon'))) {
                    const key = this.tagAttribute(iconXml, 'key');
                    const icon = iconXml.innerHTML;
                    comp.properties.set(`icon_${key}`, icon);
                }
            }
        } else {
            for (const prop of Array.from(xmlComponent.getElementsByTagName('property'))) {
                this.parseProperty(prop, comp.properties);
            }
        }
        return comp;
    }

    public parseProperty(property: Element, properties: Map<string, string>): void {
        const key = this.tagAttribute(property, 'key');
        const value = property.innerHTML;
        properties.set(key, value);
    }

    public resolveLogic(xmlRoleRefLogic: Element, roleRef: TransitionPermissionRef): void {
        roleRef.logic.reassign = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'delegate'));
        roleRef.logic.perform = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'perform'));
        const assigned = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assigned'));
        if (assigned !== undefined) {
            roleRef.logic.assign = assigned;
        } else {
            roleRef.logic.assign = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assign'));
        }
        roleRef.logic.cancel = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'cancel'));
        roleRef.logic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
    }

    public resolveLogicValue(logicValue: string): boolean | undefined {
        return (logicValue !== undefined && logicValue !== '') ? logicValue === 'true' : undefined;
    }

    public resolveCaseLogic(xmlRoleRefLogic: Element, roleRef: ProcessPermissionRef): void {
        roleRef.logic.create = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'create'));
        roleRef.logic.delete = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'delete'));
        roleRef.logic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
    }

    public checkVariability(result: PetriNetResult, arc: Arc<NodeElement, NodeElement>, reference: string | undefined): void {
        if (!reference) {
            return;
        }
        let ref: Place | DataVariable | undefined = result.model.getPlace(reference);
        if (ref === undefined) {
            ref = result.model.getData(reference);
        }
        if (ref === undefined) {
            throw new Error(`Reference of arc '${arc.id}' does not exist`);
        }
        arc.multiplicity = new Expression(ref.id, true);
    }

    public parseTrigger(xmlTrigger: Element): Trigger {
        const trigger = new Trigger();
        trigger.type = this.tagAttribute(xmlTrigger, 'type') as TriggerType;
        if (trigger.type === TriggerType.TIME) {
            trigger.delay = this.tagValue(xmlTrigger, 'delay') === '' ? undefined : this.tagValue(xmlTrigger, 'delay');
            trigger.exact = this.tagValue(xmlTrigger, 'exact') === '' ? undefined : new Date(this.tagValue(xmlTrigger, 'exact'));
        }
        return trigger;
    }

    public parseRoleRef(xmlRoleRef: Element): TransitionPermissionRef {
        const xmlRoleRefLogic = xmlRoleRef.getElementsByTagName('logic')[0];
        let id = this.tagValue(xmlRoleRef, 'id');
        if (id === 'default') {
            id = Role.DEFAULT.toString();
        }
        const roleRef = new TransitionPermissionRef(id);
        this.resolveLogic(xmlRoleRefLogic, roleRef);
        return roleRef;
    }

    public parseDataRef(xmlDataRef: Element): FlexItem {
        const item = new FlexItem();
        const dataRef = new DataRef(this.tagValue(xmlDataRef, 'id'));
        item.dataRef = dataRef;
        for (const xmlEvent of Array.from(xmlDataRef.getElementsByTagName('event'))) {
            const event = new DataEvent(this.tagAttribute(xmlEvent, 'type') as DataEventType, '');
            this.parseEvent(xmlEvent, event);
            dataRef.mergeEvent(event);
        }
        const xmlDataRefLogic = xmlDataRef.getElementsByTagName('logic')[0];
        if (xmlDataRefLogic) {
            const actionTags = Array.from(xmlDataRefLogic.getElementsByTagName('action'));
            if (actionTags.length > 0) {
                for (const actionTag of actionTags) {
                    const action = this.parseAction(actionTag, dataRef.id);
                    const actionTrigger = actionTag.getAttribute('trigger') as DataEventType;
                    dataRef.addAction(action, actionTrigger);
                }
            }
            let behaviorSet = false;
            for (const logic of Array.from(xmlDataRefLogic.getElementsByTagName('behavior'))) {
                if (logic.childNodes[0].nodeValue === 'required') {
                    dataRef.logic.required = true;
                } else if (logic.childNodes[0].nodeValue === 'immediate') {
                    dataRef.logic.immediate = true;
                } else if (!behaviorSet){
                    dataRef.logic.behavior = logic.childNodes[0].nodeValue as DataRefBehavior;
                    behaviorSet = true;
                }
            }
        }
        dataRef.component = this.parseComponent(xmlDataRef);
        // TODO: PF-75 dataRef layout?
        return item;
    }

    public parseDataGroup(xmlDataGroup: Element): Array<FlexItem> {
        const xmlDataRefs = Array.from(xmlDataGroup.getElementsByTagName('dataRef'));
        const items = new Array<FlexItem>();
        for (let i = 0; i < xmlDataRefs.length; i++) {
            const xmlDataRef = xmlDataRefs[i];
            items.push(this.parseDataRef(xmlDataRef));
        }
        return items;
    }

    public parsePlaceStatic(xmlPlace: Element): ResourceScope {
        if (this.checkLengthAndNodes(xmlPlace, 'isStatic') && xmlPlace.getElementsByTagName('isStatic')[0].childNodes[0].nodeValue === 'true') {
            return ResourceScope.PROCESS;
        }
        if (this.checkLengthAndNodes(xmlPlace, 'static') && xmlPlace.getElementsByTagName('static')[0].childNodes[0].nodeValue === 'true') {
            return ResourceScope.PROCESS
        }
        return ResourceScope.USECASE;
    }

    public parseArcType(xmlArc: Element): XmlArcType {
        let parsedArcType = XmlArcType.REGULAR;
        if (this.checkLengthAndNodes(xmlArc, 'type')) {
            parsedArcType = xmlArc.getElementsByTagName('type')[0].childNodes[0].nodeValue as XmlArcType;
        }
        return parsedArcType;
    }

    public parseEvent<T>(xmlEvent: Element, event: Event<T>): void {
        event.id = this.tagValue(xmlEvent, 'id');
        if (event.id === '') {
            event.id = event.type + "_event_" + this.getNextEventId();
        }
        for (const actionsElement of Array.from(xmlEvent.getElementsByTagName('actions'))) {
            const actionsPhase = this.tagAttribute(actionsElement, 'phase') as EventPhase;
            const actionTags = Array.from(actionsElement.getElementsByTagName('action'));
            if (actionTags.length > 0) {
                for (const actionTag of actionTags) {
                    const action = this.parseAction(actionTag);
                    event.addAction(action, actionsPhase);
                }
            }
        }
    }

    public resolveInit(xmlData: Element): I18nWithDynamic | undefined {
        let elementValue;
        for (const value of Array.from(xmlData.getElementsByTagName('init'))) {
            if (!value.parentElement?.tagName || value.parentElement.tagName !== 'data') {
                continue;
            }
            elementValue = value;
        }
        return this.resolveInitValue(elementValue);
    }

    public resolveInitValue(elementValue: Element | undefined): I18nWithDynamic | undefined {
        if (!elementValue) {
            return undefined;
        }
        const dynamic = this.tagAttribute(elementValue, 'dynamic');
        const name = this.tagAttribute(elementValue, 'name');
        const value = this.removeExcessiveIndents(elementValue.textContent ?? '');
        return new I18nWithDynamic(value, name, dynamic === '' ? undefined : dynamic === 'true');
    }

    public checkLengthAndNodes(element: Element, name: string) {
        return element.getElementsByTagName(name).length > 0 &&
            element.getElementsByTagName(name)[0].childNodes.length !== 0;
    }

    public resolveFormat(xmlData: Element, data: DataVariable): void {
        if (this.checkLengthAndNodes(xmlData, 'format')) {
            if (data.component === undefined) {
                data.component = new Component('currency');
            }
            const xmlCur = xmlData.getElementsByTagName('format')?.item(0)?.getElementsByTagName('currency').item(0);
            if (!xmlCur) {
                return;
            }
            data.component.properties.set('locale', this.tagValue(xmlCur, 'locale'));
            data.component.properties.set('code', this.tagValue(xmlCur, 'code') !== '' ? this.tagValue(xmlCur, 'code') : 'EUR');
            data.component.properties.set('fractionSize', (this.parseNumberValue(xmlCur, 'fractionSize') !== undefined ? this.parseNumberValue(xmlCur, 'fractionSize') : 2)?.toString() ?? '');
        }
    }

    public parseNumberValue(element: Element | null, name: string): number | undefined {
        if (!element) {
            return undefined;
        }
        const value = parseInt(this.tagValue(element, name), 10);
        return isNaN(value) ? undefined : value;
    }

    public parseExpression(xmlTag: Element, name: string): Expression | undefined {
        const val = this.removeExcessiveIndents(this.tagValue(xmlTag, name));
        let dynamic;
        if (xmlTag.getElementsByTagName(name).length > 0) {
            dynamic = this.tagAttribute(xmlTag.getElementsByTagName(name).item(0), 'dynamic');
        }
        if (val === '' && dynamic !== 'true') {
            return undefined;
        }
        return new Expression(val, dynamic === '' ? undefined : dynamic === 'true');
    }

    private getNextEventId(): number {
        return this.eventIdCounter++;
    }

    private getNextActionId(): number {
        return this.actionIdCounter++;
    }

    public resetEventId(): void {
        this.eventIdCounter = 0;
    }

    public resetActionId(): void {
        this.actionIdCounter = 0;
    }

    public resetIds(): void {
        this.resetEventId();
        this.resetActionId();
    }

    parseTags(xmlDoc: Element | Document, properties: Map<string, string>): void {
        const tagsElement = xmlDoc.getElementsByTagName('tags')[0];
        if (tagsElement?.children && tagsElement.children.length > 0) {
            for (const tagElement of Array.from(xmlDoc.getElementsByTagName('tag'))) {
                this.parseTag(properties, tagElement);
            }
        }
    }

    parseTag(tags: Map<string, string>, tagElement: Element): void {
        const key = this.tagAttribute(tagElement, 'key');
        const value = tagElement.innerHTML;
        tags.set(key, value);
    }
}
