import {
    Action,
    Alignment,
    Appearance,
    CompactDirection,
    Component,
    DataEvent,
    DataEventType,
    DataGroup,
    DataLayout,
    DataRef,
    DataRefBehavior,
    Event,
    EventPhase,
    Expression,
    FunctionScope,
    HideEmptyRows,
    I18nString,
    I18nWithDynamic,
    LayoutType,
    PetriflowFunction,
    ProcessRoleRef,
    ProcessUserRef,
    Property,
    RoleRef,
    Template,
    Trigger,
    TriggerType,
    UserRef, XmlArcType
} from '../model';

export class ImportUtils {

    private eventIdCounter = 0;
    private actionIdCounter = 0;

    public tagValue(xmlTag: Element | Document | null, child: string): string {
        if (!xmlTag || xmlTag.getElementsByTagName(child).length === 0 || xmlTag.getElementsByTagName(child)[0].childNodes.length === 0) {
            return '';
        }
        const parentNodeName = xmlTag.nodeName === '#document' ? 'process' : xmlTag.nodeName;
        const tags: Element[] = Array.from(xmlTag.getElementsByTagName(child)).filter(tag => tag?.parentNode?.nodeName === parentNodeName);
        if (tags === undefined || tags.length === 0 || tags[0]?.childNodes.length === 0) {
            return '';
        }
        return tags[0]?.childNodes[0]?.nodeValue ?? '';
    }

    public parseI18n(xmlTag: Element | Document, child: string): I18nString {
        const i18n = new I18nString(this.tagValue(xmlTag, child));
        if (i18n.value !== '') {
            const id = xmlTag.getElementsByTagName(child)[0].getAttribute('id');
            i18n.id = id === null ? undefined : id;
        }
        return i18n;
    }

    public parseI18nWithDynamic(xmlTag: Element | Document, child: string): I18nWithDynamic {
        const i18n = new I18nWithDynamic(this.tagValue(xmlTag, child));
        if (i18n.value !== '') {
            const id = xmlTag.getElementsByTagName(child)[0].getAttribute('id');
            i18n.id = id === null ? undefined : id;
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

    public parseAction(actionTag: Element): Action {
        const actionId = actionTag.getAttribute('id') ?? 'action_' + this.getNextActionId();
        const definition = this.parseDefinition(actionTag);
        return new Action(actionId, definition.trim());
    }

    parseFunction(xmlFunction: Element) {
        const name = this.tagAttribute(xmlFunction, 'name');
        const scope = this.tagAttribute(xmlFunction, 'scope') as FunctionScope;
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
            } else if (node.nodeName === '#cdata-section') {
                definition += '<![CDATA[' + node.nodeValue + ']]>';
            } else {
                definition += node.nodeValue?.trim();
            }
        }
        return this.removeExcessiveIndents(definition);
    }

    public removeExcessiveIndents(action: string): string {
        action = action.trim().replace(/\t/g, '    ');
        const lines = action.split('\n');
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

    public parseComponent(xmlTag: Element): Component | undefined {
        const xmlComponent = xmlTag.getElementsByTagName('component')[0];
        if (!xmlComponent?.children || xmlComponent.children.length === 0) {
            return undefined;
        }
        const comp = new Component(this.tagValue(xmlComponent, 'id'));
        const properties = xmlComponent.getElementsByTagName('properties')[0];
        if (properties?.children && properties.children.length > 0) {
            for (const prop of Array.from(properties.getElementsByTagName('property'))) {
                comp.properties.push(this.parseProperty(prop));
            }
        } else {
            for (const prop of Array.from(xmlComponent.getElementsByTagName('property'))) {
                comp.properties.push(this.parseProperty(prop));
            }
        }
        return comp;
    }

    public parseProperties(xmlTag: Element): Array<Property> | undefined {
        const propertiesCollection: HTMLCollectionOf<Element> = xmlTag.getElementsByTagName('properties')
        if (!propertiesCollection || propertiesCollection.length === 0) {
            return [];
        }
        const properties = propertiesCollection[0];
        if (!properties?.children || properties.children.length === 0) {
            return [];
        }
        return Array.from(properties.getElementsByTagName('property'))
            .map(propertyElement => this.parseProperty(propertyElement));
    }

    public parseProperty(property: Element): Property {
        const key = this.tagAttribute(property, 'key');
        const value = property.innerHTML;
        return new Property(key, value);
    }

    public resolveLogic(xmlRoleRefLogic: Element, roleRef: RoleRef | UserRef): void {
        roleRef.logic.reassign = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'reassign'));
        roleRef.logic.perform = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'perform'));
        /* @deprecated - 'this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assigned'))' is deprecated and it and following line will be removed in future versions. */
        const assigned = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assigned'));
        if (assigned !== undefined) {
            roleRef.logic.assign = assigned;
        } else {
            roleRef.logic.assign = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assign'));
        }
        roleRef.logic.cancel = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'cancel'));
        roleRef.logic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
        roleRef.logic.viewDisabled = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view_disabled'));
    }

    public resolveLogicValue(logicValue: string): boolean | undefined {
        return (logicValue !== undefined && logicValue !== '') ? logicValue === 'true' : undefined;
    }

    public resolveCaseLogic(xmlRoleRefLogic: Element, roleRef: ProcessRoleRef | ProcessUserRef): void {
        roleRef.caseLogic.create = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'create'));
        roleRef.caseLogic.delete = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'delete'));
        roleRef.caseLogic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
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

    public parseRoleRef(xmlRoleRef: Element): RoleRef {
        const xmlRoleRefLogic = xmlRoleRef.getElementsByTagName('logic')[0];
        const roleRef = new RoleRef(this.tagValue(xmlRoleRef, 'id'));
        this.resolveLogic(xmlRoleRefLogic, roleRef);
        roleRef.properties = this.parseProperties(xmlRoleRef);
        return roleRef;
    }

    public parseDataRef(xmlDataRef: Element, index: number): DataRef {
        const dataRef = new DataRef(this.tagValue(xmlDataRef, 'id'));
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
                    const action = this.parseAction(actionTag);
                    const actionTrigger = actionTag.getAttribute('trigger') as DataEventType;
                    dataRef.addAction(action, actionTrigger);
                }
            }
            for (const logic of Array.from(xmlDataRefLogic.getElementsByTagName('behavior'))) {
                if (logic.childNodes[0].nodeValue as DataRefBehavior === DataRefBehavior.REQUIRED) {
                    dataRef.logic.required = true;
                } else if (logic.childNodes[0].nodeValue as DataRefBehavior === DataRefBehavior.IMMEDIATE) {
                    dataRef.logic.immediate = true;
                } else if (logic.childNodes[0].nodeValue as DataRefBehavior !== DataRefBehavior.OPTIONAL) {
                    dataRef.logic.behavior = logic.childNodes[0].nodeValue as DataRefBehavior;
                }
            }
        }
        dataRef.component = this.parseComponent(xmlDataRef);
        dataRef.properties = this.parseProperties(xmlDataRef)
        const xmlLayout = xmlDataRef.getElementsByTagName('layout');
        if (xmlLayout.length !== 0) {
            dataRef.layout = this.parseDataLayout(xmlLayout.item(0));
        } else {
            dataRef.layout = new DataLayout();
            dataRef.layout.x = 0;
            dataRef.layout.y = index;
            dataRef.layout.rows = 1;
            dataRef.layout.cols = 2;
        }
        return dataRef;
    }

    public parseDataLayout(xmlLayout: Element | null): DataLayout {
        const layout = new DataLayout();
        if (!xmlLayout) {
            return layout;
        }
        layout.x = this.parseNumberValue(xmlLayout, 'x') ?? 0;
        layout.y = this.parseNumberValue(xmlLayout, 'y') ?? 0;
        layout.rows = this.parseNumberValue(xmlLayout, 'rows') ?? 0;
        layout.cols = this.parseNumberValue(xmlLayout, 'cols') ?? 0;
        layout.template = this.tagValue(xmlLayout, 'template') as Template;
        layout.appearance = this.tagValue(xmlLayout, 'appearance') as Appearance;
        layout.offset = this.parseNumberValue(xmlLayout, 'offset');
        layout.alignment = this.tagValue(xmlLayout, 'alignment') as Alignment;
        return layout;
    }

    public parseDataGroup(xmlDataGroup: Element): DataGroup {
        const dataGroup = new DataGroup(this.tagValue(xmlDataGroup, 'id'));
        dataGroup.alignment = this.tagValue(xmlDataGroup, 'alignment') as Alignment;
        dataGroup.layout = this.tagValue(xmlDataGroup, 'layout') as LayoutType;
        if (dataGroup.layout && dataGroup.layout !== LayoutType.LEGACY) {
            const cols = this.parseNumberValue(xmlDataGroup, 'cols');
            if (cols && cols > 0) {
                dataGroup.cols = cols;
            }
            const rows = this.parseNumberValue(xmlDataGroup, 'rows');
            if (rows && rows > 0 || rows === 0) {
                dataGroup.rows = rows;
            }
        }
        dataGroup.stretch = this.tagValue(xmlDataGroup, 'stretch') === 'true';
        dataGroup.hideEmptyRows = this.tagValue(xmlDataGroup, 'hideEmptyRows') as HideEmptyRows;
        dataGroup.compactDirection = this.tagValue(xmlDataGroup, 'compactDirection') as CompactDirection;
        dataGroup.title = this.parseI18n(xmlDataGroup, 'title');
        const xmlDataRefs = Array.from(xmlDataGroup.getElementsByTagName('dataRef'));
        for (let i = 0; i < xmlDataRefs.length; i++) {
            const xmlDataRef = xmlDataRefs[i];
            dataGroup.addDataRef(this.parseDataRef(xmlDataRef, i));
        }
        return dataGroup;
    }

    public parsePlaceStatic(xmlPlace: Element): boolean {
        let isStatic = false;
        if (this.checkLengthAndNodes(xmlPlace, 'isStatic')) {
            isStatic = (xmlPlace.getElementsByTagName('isStatic')[0].childNodes[0].nodeValue === 'true');
        }
        if (this.checkLengthAndNodes(xmlPlace, 'static')) {
            isStatic = (xmlPlace.getElementsByTagName('static')[0].childNodes[0].nodeValue === 'true');
        }
        return isStatic;
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
        event.properties = this.parseProperties(xmlEvent);
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
        const name = this.tagAttribute(elementValue, 'id');
        return new I18nWithDynamic(elementValue.textContent ?? '', name, dynamic === '' ? undefined : dynamic === 'true');
    }

    public checkLengthAndNodes(element: Element, name: string) {
        return element.getElementsByTagName(name).length > 0 &&
            element.getElementsByTagName(name)[0].childNodes.length !== 0;
    }

    public parseNumberValue(element: Element | null, name: string): number | undefined {
        if (!element) {
            return undefined;
        }
        const value = parseInt(this.tagValue(element, name), 10);
        return isNaN(value) ? undefined : value;
    }

    public parseExpression(xmlTag: Element, name: string): Expression | undefined {
        const val = this.tagValue(xmlTag, name);
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
}
