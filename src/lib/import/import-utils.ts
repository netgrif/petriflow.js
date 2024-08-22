import {
    Action,
    Component,
    DataEvent,
    DataEventType,
    DataRef,
    DataRefBehavior,
    Event,
    EventPhase,
    Expression, Extension,
    FlexAlignContent,
    FlexAlignItems,
    FlexContainer,
    FlexContainerProperties,
    FlexDirection,
    FlexDisplay,
    FlexItem,
    FlexItemAlignSelf,
    FlexItemProperties,
    FlexJustifyContent,
    FlexWrap,
    FunctionScope,
    GridAlignContent,
    GridAlignItems,
    GridAutoFlow,
    GridContainer,
    GridContainerProperties,
    GridDisplay,
    GridItem,
    GridItemAlignSelf,
    GridItemProperties,
    GridJustifyContent,
    I18nString,
    I18nWithDynamic,
    IdentifierBlacklist,
    JustifyItems,
    JustifySelf,
    PetriflowFunction,
    ProcessPermissionRef,
    Property,
    TransitionPermissionRef,
    Trigger,
    TriggerType,
    XmlArcType
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

    public parseIdentifier(xmlTag: Element | Document | null, child: string): string {
        const xmlIdentifierString = this.tagValue(xmlTag, child);
        if (xmlIdentifierString === '') {
            throw new Error(`Id of ${xmlTag?.nodeName} must be defined`);
        }
        if ((Object.values(IdentifierBlacklist) as string[]).includes(xmlIdentifierString)) {
            throw new Error(`Id of ${xmlTag?.nodeName} must not be Java or Groovy keyword, value [${xmlIdentifierString}]`);
        }
        const identifierRegex = new RegExp("^[$_a-zA-Z][_a-zA-Z0-9]*$");
        if (!identifierRegex.test(xmlIdentifierString)) {
            throw new Error(`Id of ${xmlTag?.nodeName} must be valid Java identifier, value [${xmlIdentifierString}]`);
        }
        return xmlIdentifierString;
    }

    public parseI18nWithDynamic(xmlTag: Element | Document, child: string): I18nWithDynamic {
        const i18n = new I18nWithDynamic(this.removeExcessiveIndents(this.tagValue(xmlTag, child)));
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

    public parseComponent(xmlTag: Element): Component | undefined {
        const xmlComponent = xmlTag.getElementsByTagName('component')[0];
        if (!xmlComponent?.children || xmlComponent.children.length === 0) {
            return undefined;
        }
        const comp = new Component(this.parseIdentifier(xmlComponent, 'id'));
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

    public parseProperties(xmlTag: Element): Array<Property> {
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

    public resolveLogic(xmlRoleRefLogic: Element, roleRef: TransitionPermissionRef): void {
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

    public resolveCaseLogic(xmlRoleRefLogic: Element, roleRef: ProcessPermissionRef): void {
        roleRef.logic.create = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'create'));
        roleRef.logic.delete = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'delete'));
        roleRef.logic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
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
        const roleRef = new TransitionPermissionRef(this.parseIdentifier(xmlRoleRef, 'id'));
        this.resolveLogic(xmlRoleRefLogic, roleRef);
        roleRef.properties = this.parseProperties(xmlRoleRef);
        return roleRef;
    }

    public parseDataRef(xmlDataRef: Element): DataRef {
        const dataRef = new DataRef(this.parseIdentifier(xmlDataRef, 'id'));
        for (const xmlEvent of Array.from(xmlDataRef.getElementsByTagName('event'))) {
            const event = new DataEvent(this.tagAttribute(xmlEvent, 'type') as DataEventType, '');
            this.parseEvent(xmlEvent, event);
            dataRef.mergeEvent(event);
        }
        const xmlDataRefLogic = xmlDataRef.getElementsByTagName('logic')[0];
        if (xmlDataRefLogic) {
            const elementName = 'behavior';
            if (this.isElementValueDefined(xmlDataRefLogic, elementName)) {
                dataRef.logic.behavior = this.tagValue(xmlDataRefLogic, elementName) as DataRefBehavior;
            }
            dataRef.logic.immediate = this.tagValue(xmlDataRefLogic, 'immediate') === 'true'
            dataRef.logic.required = this.tagValue(xmlDataRefLogic, 'required') === 'true'
        }
        dataRef.component = this.parseComponent(xmlDataRef);
        dataRef.properties = this.parseProperties(xmlDataRef)
        return dataRef;
    }

    public parseGrid(xmlGrid: Element): GridContainer {
        const grid = new GridContainer(this.parseIdentifier(xmlGrid, 'id'));

        const properties = this.getChildElementByName(xmlGrid.children, 'properties');
        if (properties) {
            grid.properties = this.parseGridContainerProperties(properties);
        }

        this.getAllChildElementsByName(xmlGrid.children, 'item').forEach(xmlGridItem => {
            grid.addItem(this.parseGridItem(xmlGridItem));
        });
        return grid;
    }

    public parseGridContainerProperties(xmlGridProperties: Element): GridContainerProperties {
        const gridProperties = new GridContainerProperties();

        let elementName = 'display';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.display = this.tagValue(xmlGridProperties, elementName) as GridDisplay;
        }

        elementName = 'grid-template-columns';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridTemplateColumns = this.tagValue(xmlGridProperties, 'grid-template-columns');
        }

        elementName = 'grid-template-rows';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridTemplateRows = this.tagValue(xmlGridProperties, 'grid-template-rows');
        }

        elementName = 'grid-template-areas';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridTemplateAreas = this.tagValue(xmlGridProperties, 'grid-template-areas');
        }

        elementName = 'grid-template';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridTemplate = this.tagValue(xmlGridProperties, 'grid-template');
        }

        elementName = 'grid-column-gap';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridColumnGap = this.tagValue(xmlGridProperties, 'grid-column-gap');
        }

        elementName = 'column-gap';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.columnGap = this.tagValue(xmlGridProperties, 'column-gap');
        }

        elementName = 'row-gap';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.rowGap = this.tagValue(xmlGridProperties, 'row-gap');
        }

        elementName = 'grid-row-gap';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridRowGap = this.tagValue(xmlGridProperties, 'grid-row-gap');
        }

        elementName = 'grid-gap';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridGap = this.tagValue(xmlGridProperties, 'grid-gap');
        }

        elementName = 'gap';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gap = this.tagValue(xmlGridProperties, 'gap');
        }

        elementName = 'justify-items';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.justifyItems = this.tagValue(xmlGridProperties, elementName) as JustifyItems;
        }

        elementName = 'align-items';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.alignItems = this.tagValue(xmlGridProperties, elementName) as GridAlignItems;
        }

        elementName = 'place-items';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.placeItems = this.tagValue(xmlGridProperties, 'place-items');
        }
        elementName = 'justify-content';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.justifyContent = this.tagValue(xmlGridProperties, elementName) as GridJustifyContent;
        }
        elementName = 'align-content';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.alignContent = this.tagValue(xmlGridProperties, elementName) as GridAlignContent;
        }

        elementName = 'place-content';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.placeContent = this.tagValue(xmlGridProperties, 'place-content');
        }

        elementName = 'grid-auto-columns';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridAutoColumns = this.tagValue(xmlGridProperties, 'grid-auto-columns');
        }

        elementName = 'grid-auto-rows';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridAutoRows = this.tagValue(xmlGridProperties, 'grid-auto-rows');
        }

        elementName = 'grid-auto-flow';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.gridAutoFlow = this.tagValue(xmlGridProperties, elementName) as GridAutoFlow;
        }

        elementName = 'grid';
        if (this.isElementValueDefined(xmlGridProperties, elementName)) {
            gridProperties.grid = this.tagValue(xmlGridProperties, 'grid');
        }
        return gridProperties;
    }

    public parseGridItem(xmlGridItem: Element): GridItem {
        const gridItem = new GridItem();

        let xmlElement = this.getChildElementByName(xmlGridItem.children, 'properties');
        if (xmlElement) {
            gridItem.properties = this.parseGridItemProperties(xmlElement);
        }

        xmlElement = this.getChildElementByName(xmlGridItem.children, 'dataRef');
        if (xmlElement) {
            gridItem.dataRef = this.parseDataRef(xmlElement);
        }

        xmlElement = this.getChildElementByName(xmlGridItem.children, 'grid');
        if (xmlElement) {
            gridItem.grid = this.parseGrid(xmlElement);
        }

        xmlElement = this.getChildElementByName(xmlGridItem.children, 'flex');
        if (xmlElement) {
            gridItem.flex = this.parseFlex(xmlElement);
        }

        return gridItem;
    }

    public parseGridItemProperties(xmlGridItemProperties: Element) {
        const gridItemProperties = new GridItemProperties();

        let elementName = 'grid-column-start';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.gridColumnStart = this.tagValue(xmlGridItemProperties, 'grid-column-start');
        }

        elementName = 'grid-column-end';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.gridColumnEnd = this.tagValue(xmlGridItemProperties, 'grid-column-end');
        }

        elementName = 'grid-row-start';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.gridRowStart = this.tagValue(xmlGridItemProperties, 'grid-row-start');
        }

        elementName = 'grid-row-end';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.gridRowEnd = this.tagValue(xmlGridItemProperties, 'grid-row-end');
        }

        elementName = 'grid-column';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.gridColumn = this.tagValue(xmlGridItemProperties, 'grid-column');
        }

        elementName = 'grid-row';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.gridRow = this.tagValue(xmlGridItemProperties, 'grid-row');
        }

        elementName = 'grid-area';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.gridArea = this.tagValue(xmlGridItemProperties, 'grid-area');
        }
        elementName = 'justify-self';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.justifySelf = this.tagValue(xmlGridItemProperties, elementName) as JustifySelf;
        }

        elementName = 'align-self';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.alignSelf = this.tagValue(xmlGridItemProperties, elementName) as GridItemAlignSelf;
        }

        elementName = 'place-self';
        if (this.isElementValueDefined(xmlGridItemProperties, elementName)) {
            gridItemProperties.placeSelf = this.tagValue(xmlGridItemProperties, elementName);
        }

        return gridItemProperties;
    }

    private isElementValueDefined(xmlElement: Element, elementName: string): boolean {
        if (xmlElement.getElementsByTagName(elementName).length < 1) {
            return false;
        }
        const elementValue = this.tagValue(xmlElement, elementName);
        return !!elementValue && elementValue !== '';
    }

    public parseFlex(xmlFlex: Element) {
        const flex = new FlexContainer(this.parseIdentifier(xmlFlex, 'id'));
        const properties = this.getChildElementByName(xmlFlex.children, 'properties');
        if (properties) {
            flex.properties = this.parseFlexContainerProperties(properties);
        }
        this.getAllChildElementsByName(xmlFlex.children, 'item').forEach(xmlFlexItem => {
            flex.addItem(this.parseFlexItem(xmlFlexItem));
        });
        return flex;
    }

    public parseFlexContainerProperties(xmlFlexProperties: Element): FlexContainerProperties {
        const flexProperties: FlexContainerProperties = new FlexContainerProperties();
        let elementName = 'display';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.display = this.tagValue(xmlFlexProperties, elementName) as FlexDisplay;
        }

        elementName = 'flex-direction';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.flexDirection = this.tagValue(xmlFlexProperties, elementName) as FlexDirection;
        }

        elementName = 'flex-wrap';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.flexWrap = this.tagValue(xmlFlexProperties, elementName) as FlexWrap;
        }

        elementName = 'flex-flow';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.flexFlow = this.tagValue(xmlFlexProperties, 'flex-flow');
        }

        elementName = 'justify-content';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.justifyContent = this.tagValue(xmlFlexProperties, elementName) as FlexJustifyContent;
        }

        elementName = 'align-items';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.alignItems = this.tagValue(xmlFlexProperties, elementName) as FlexAlignItems;
        }

        elementName = 'align-content';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.alignContent = this.tagValue(xmlFlexProperties, elementName) as FlexAlignContent;
        }

        elementName = 'gap';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.gap = this.tagValue(xmlFlexProperties, 'gap');
        }

        elementName = 'row-gap';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.rowGap = this.tagValue(xmlFlexProperties, 'row-gap');
        }

        elementName = 'column-gap';
        if (this.isElementValueDefined(xmlFlexProperties, elementName)) {
            flexProperties.columnGap = this.tagValue(xmlFlexProperties, 'column-gap');
        }

        return flexProperties;
    }

    public parseFlexItem(xmlFlexItem: Element): FlexItem {
        const flexItem = new FlexItem();

        let xmlElement = this.getChildElementByName(xmlFlexItem.children, 'properties');
        if (xmlElement) {
            flexItem.properties = this.parseFlexItemProperties(xmlElement);
        }

        xmlElement = this.getChildElementByName(xmlFlexItem.children, 'dataRef');
        if (xmlElement) {
            flexItem.dataRef = this.parseDataRef(xmlElement);
        }

        xmlElement = this.getChildElementByName(xmlFlexItem.children, 'grid');
        if (xmlElement) {
            flexItem.grid = this.parseGrid(xmlElement);
        }

        xmlElement = this.getChildElementByName(xmlFlexItem.children, 'flex');
        if (xmlElement) {
            flexItem.flex = this.parseFlex(xmlElement);
        }
        return flexItem;
    }

    public getChildElementByName(children: HTMLCollection, name: string): Element | undefined {
        return this.getAllChildElementsByName(children, name)[0]
    }

    public getAllChildElementsByName(children: HTMLCollection, name: string): Array<Element> {
        return Array.from(children).filter(childElement => childElement.localName === name)
    }

    public parseFlexItemProperties(xmlFlexItemProperties: Element): FlexItemProperties {
        const flexItemProperties = new FlexItemProperties();

        flexItemProperties.order = this.parseNumberValue(xmlFlexItemProperties, 'order') ?? 0;
        flexItemProperties.flexGrow = this.parseNumberValue(xmlFlexItemProperties, 'flex-grow') ?? 0;
        flexItemProperties.flexShrink = this.parseNumberValue(xmlFlexItemProperties, 'flex-shrink') ?? 1;

        let xmlElement = xmlFlexItemProperties.getElementsByTagName('flex-basis')[0];
        if (xmlElement) {
            flexItemProperties.flexBasis = this.tagValue(xmlFlexItemProperties, 'flex-basis');
        }

        xmlElement = xmlFlexItemProperties.getElementsByTagName('flex')[0];
        if (xmlElement) {
            flexItemProperties.flex = this.tagValue(xmlFlexItemProperties, 'flex');
        }

        xmlElement = xmlFlexItemProperties.getElementsByTagName('align-self')[0];
        if (xmlElement) {
            flexItemProperties.alignSelf = this.tagValue(xmlFlexItemProperties, 'align-self') as FlexItemAlignSelf;
        }
        return flexItemProperties;
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
        event.id = this.parseIdentifier(xmlEvent, 'id');
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
        const value = this.removeExcessiveIndents(elementValue.textContent ?? '');
        return new I18nWithDynamic(value, name, dynamic === '' ? undefined : dynamic === 'true');
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

    parseTags(xmlDoc: Element | Document): Map<string, string> {
        const tags = new Map<string, string>();
        const tagsElement = xmlDoc.getElementsByTagName('tags')[0];
        if (tagsElement?.children && tagsElement.children.length > 0) {
            for (const tagElement of Array.from(xmlDoc.getElementsByTagName('tag'))) {
                this.parseTag(tags, tagElement);
            }
        }
        return tags;
    }

    parseTag(tags: Map<string, string>, tagElement: Element): void {
        const key = this.tagAttribute(tagElement, 'key');
        const value = tagElement.innerHTML;
        tags.set(key, value);
    }

    public parseExtension(xmlDoc: Document): Extension | undefined {
        const xmlExtension = xmlDoc.getElementsByTagName('extends')[0];
        if (xmlExtension === undefined) {
            return undefined;
        }
        return new Extension(this.tagValue(xmlExtension, 'id'), this.tagValue(xmlExtension, 'version'))
    }
}
