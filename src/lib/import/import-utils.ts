import {
    Action,
    Alignment,
    Appearance,
    Arc,
    ArcType,
    Component,
    DataEvent,
    DataEventType,
    DataGroup,
    DataLayout,
    DataRef,
    DataRefBehavior,
    DataVariable,
    Event,
    EventPhase,
    Expression,
    I18nString,
    I18nWithDynamic,
    Icon,
    IconType,
    LayoutType,
    PetriNet,
    Place,
    ProcessRoleRef,
    ProcessUserRef,
    Property,
    RoleRef,
    Template,
    Trigger,
    TriggerType,
    UserRef
} from '../model';

export class ImportUtils {

    private eventIdCounter = 0;
    private actionIdCounter = 0;

    public tagValue(xmlTag: Element | Document | null, child: string): string {
        if (xmlTag?.nodeValue?.trim() === '') return '';
        if (!xmlTag || xmlTag.getElementsByTagName(child).length === 0 || xmlTag.getElementsByTagName(child).item(0)?.childNodes.length === 0) {
            return '';
        }
        const parentNodeName = xmlTag.nodeName === '#document' ? 'document' : xmlTag.nodeName;
        const tags: Element[] = Array.from(xmlTag.getElementsByTagName(child)).filter(tag => tag?.parentNode?.nodeName === parentNodeName);
        if (tags === undefined || tags.length === 0 || tags[0]?.childNodes.length === 0) {
            return '';
        }
        return tags[0]?.childNodes.item(0)?.nodeValue ?? '';
    }

    public parseI18n(xmlTag: Element | Document, child: string): I18nString {
        const i18n = new I18nString(this.tagValue(xmlTag, child));
        if (i18n.value !== '') {
            const name = xmlTag.getElementsByTagName(child).item(0)?.getAttribute('name');
            i18n.name = name ?? undefined;
        }
        return i18n;
    }

    public parseI18nWithDynamic(xmlTag: Element | Document, child: string): I18nWithDynamic {
        const i18n = new I18nWithDynamic(this.tagValue(xmlTag, child));
        if (i18n.value !== '') {
            const name = xmlTag.getElementsByTagName(child).item(0)?.getAttribute('name');
            i18n.name = name ?? undefined;
            i18n.dynamic = xmlTag.getElementsByTagName(child).item(0)?.getAttribute('dynamic') === 'true';
        }
        return i18n;
    }

    public tagAttribute(xmlTag: Element | null, attribute: string): string {
        if (!xmlTag)
            return '';
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
        let actionDefinition = '';
        for (const node of Array.from(actionTag.childNodes)) {
            if (node.nodeName === '#comment') {
                if (!node.nodeValue || node.nodeValue.includes('@formatter')) {
                    continue;
                }
                actionDefinition += '<!--' + node.nodeValue + '-->';
            } else if (node.nodeName === '#cdata-section') {
                actionDefinition += '<![CDATA[' + node.nodeValue + ']]>';
            } else {
                actionDefinition += node.nodeValue?.trim();
            }
        }
        return new Action(actionId, actionDefinition.trim());
    }

    public parseEncryption(xmlTag: Element): string | undefined {
        const encryption = this.tagValue(xmlTag, 'encryption');
        if (!encryption || encryption !== 'true') {
            return undefined;
        }
        const algorithm = xmlTag.getElementsByTagName('encryption').item(0)?.getAttribute('algorithm');
        if (typeof algorithm === 'string' && algorithm !== '') {
            return algorithm;
        }
        return encryption;
    }

    public parseViewAndComponent(xmlTag: Element): Component | undefined {
        const xmlComponent = xmlTag.getElementsByTagName('component').item(0);
        if (!xmlComponent?.childNodes || xmlComponent.childNodes.length === 0) {
            const xmlViewTag = xmlTag.getElementsByTagName('view').item(0);
            if (!xmlViewTag?.childNodes || xmlViewTag.childNodes.length === 0) {
                return undefined;
            }
            // TODO: <view><list>5</list></view>
            return new Component(xmlViewTag.childNodes.item(0)?.nodeName);
        }
        return this.parseComponent(xmlTag);
    }

    public parseComponent(xmlTag: Element): Component | undefined {
        const xmlComponent = xmlTag.getElementsByTagName('component').item(0);
        if (!xmlComponent?.childNodes || xmlComponent?.childNodes?.length === 0) {
            return undefined;
        }
        const comp = new Component(this.tagValue(xmlComponent, 'name'));
        const properties = xmlComponent.getElementsByTagName('properties').item(0);
        if (properties?.childNodes && properties.childNodes.length > 0) {
            for (const prop of Array.from(properties.getElementsByTagName('property'))) {
                comp.properties.push(this.parseProperty(prop));
            }
            const icons = properties.getElementsByTagName('option_icons').item(0);
            if (icons?.childNodes && icons?.childNodes?.length > 0) {
                for (const iconXml of Array.from(icons.getElementsByTagName('icon'))) {
                    const key = this.tagAttribute(iconXml, 'key');
                    let type = this.tagAttribute(iconXml, 'type') as IconType;
                    if (type as string === '') {
                        type = IconType.MATERIAL;
                    }
                    const icon = iconXml.innerHTML;
                    comp.icons.push(new Icon(key, icon, type));
                }
            }
        } else {
            for (const prop of Array.from(xmlComponent.getElementsByTagName('property'))) {
                comp.properties.push(this.parseProperty(prop));
            }
        }
        return comp;
    }

    public parseProperty(property: Element): Property {
        const key = this.tagAttribute(property, 'key');
        const value = property.innerHTML;
        return new Property(key, value);
    }

    public resolveLogic(xmlRoleRefLogic: Element | null, roleRef: RoleRef | UserRef): void {
        if (!xmlRoleRefLogic)
            return;
        roleRef.logic.delegate = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'delegate'));
        roleRef.logic.perform = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'perform'));
        roleRef.logic.assigned = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assigned'));
        roleRef.logic.cancel = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'cancel'));
        roleRef.logic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
    }

    public resolveLogicValue(logicValue: string): boolean | undefined {
        return (logicValue !== undefined && logicValue !== '') ? logicValue === 'true' : undefined;
    }

    public resolveCaseLogic(xmlRoleRefLogic: Element | null, roleRef: ProcessRoleRef | ProcessUserRef): void {
        if (!xmlRoleRefLogic) return;
        roleRef.caseLogic.create = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'create'));
        roleRef.caseLogic.delete = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'delete'));
        roleRef.caseLogic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
    }

    public checkVariability(model: PetriNet, arc: Arc, reference: string | undefined): void {
        if (!reference) return;
        let ref: Place | DataVariable | undefined = model.getPlace(reference);
        if (ref) {
            this.attachReference(arc, ref);
        } else {
            ref = model.getData(reference);
            if (ref) {
                this.attachReference(arc, ref);
            }
        }
    }

    public attachReference(arc: Arc, reference: Place | DataVariable): void {
        const weight = reference instanceof Place ? reference.marking : parseInt(reference.init?.expression ?? '' as string, 10);

        if (isNaN(weight)) {
            throw new Error('Not a number. Cannot change the value of arc weight.');
        }
        if (weight < 0) {
            throw new Error('A negative number. Cannot change the value of arc weight.');
        }

        if (!isNaN(weight) && weight >= 0) {
            arc.multiplicity = weight;
            arc.reference = reference.id;
        }
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
        const xmlRoleRefLogic = xmlRoleRef.getElementsByTagName('logic').item(0);
        const roleRef = new RoleRef(this.tagValue(xmlRoleRef, 'id'));
        this.resolveLogic(xmlRoleRefLogic, roleRef);
        return roleRef;
    }

    public parseDataRef(xmlDataRef: Element, index: number): DataRef {
        const dataRef = new DataRef(this.tagValue(xmlDataRef, 'id'));
        for (const xmlEvent of Array.from(xmlDataRef.getElementsByTagName('event'))) {
            const event = new DataEvent(this.tagAttribute(xmlEvent, 'type') as DataEventType, '');
            this.parseEvent(xmlEvent, event);
            dataRef.mergeEvent(event);
        }
        const xmlDataRefLogic = xmlDataRef.getElementsByTagName('logic').item(0);
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
                if (logic.childNodes.item(0)?.nodeValue as DataRefBehavior === DataRefBehavior.REQUIRED) {
                    dataRef.logic.required = true;
                } else if (logic.childNodes.item(0)?.nodeValue as DataRefBehavior !== DataRefBehavior.OPTIONAL) {
                    dataRef.logic.behavior = logic.childNodes.item(0)?.nodeValue as DataRefBehavior;
                }
            }
        }
        dataRef.component = this.parseComponent(xmlDataRef);
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
        if (!xmlLayout)
            return layout;
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
        dataGroup.cols = this.parseNumberValue(xmlDataGroup, 'cols');
        dataGroup.rows = this.parseNumberValue(xmlDataGroup, 'rows');
        dataGroup.alignment = this.tagValue(xmlDataGroup, 'alignment') as Alignment;
        dataGroup.layout = this.tagValue(xmlDataGroup, 'layout') as LayoutType;
        dataGroup.stretch = this.tagValue(xmlDataGroup, 'stretch') === 'true';
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
            isStatic = (xmlPlace.getElementsByTagName('isStatic').item(0)?.childNodes.item(0)?.nodeValue === 'true');
        }
        if (this.checkLengthAndNodes(xmlPlace, 'static')) {
            isStatic = (xmlPlace.getElementsByTagName('static').item(0)?.childNodes.item(0)?.nodeValue === 'true');
        }
        return isStatic;
    }

    public parseArcType(xmlArc: Element): ArcType {
        let parsedArcType = ArcType.REGULAR;
        if (this.checkLengthAndNodes(xmlArc, 'type')) {
            parsedArcType = xmlArc.getElementsByTagName('type').item(0)?.childNodes.item(0)?.nodeValue as ArcType;
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

    public resolveInits(xmlData: Element): Array<Expression> {
        const inits: Array<Expression> = [];
        if (this.checkLengthAndNodes(xmlData, 'inits')) {
            for (const value of Array.from(xmlData.getElementsByTagName('inits').item(0)?.getElementsByTagName('init') ?? [])) {
                const dynamic = this.tagAttribute(value, 'dynamic');
                inits.push(new Expression(value.textContent ?? '', dynamic === '' ? undefined : dynamic === 'true'));
            }
        }
        return inits;
    }

    public resolveInit(xmlData: Element): Expression | undefined {
        let elementValue;
        for (const value of Array.from(xmlData.getElementsByTagName('init'))) {
            if (value.parentNode?.nodeName !== 'data') {
                continue;
            }
            elementValue = value;
        }
        if (!elementValue)
            return undefined;
        const dynamic = this.tagAttribute(elementValue, 'dynamic');
        return new Expression(elementValue.textContent ?? '', dynamic === '' ? undefined : dynamic === 'true');
    }

    public checkLengthAndNodes(element: Element, name: string) {
        return element.getElementsByTagName(name).length > 0 &&
            element.getElementsByTagName(name).item(0)?.childNodes?.length !== 0;
    }

    public resolveFormat(xmlData: Element, data: DataVariable): void {
        if (this.checkLengthAndNodes(xmlData, 'format')) {
            if (data.component === undefined) {
                data.component = new Component('currency');
            }
            const xmlCur = xmlData.getElementsByTagName('format')?.item(0)?.getElementsByTagName('currency').item(0);
            if (!xmlCur) return;
            data.component.properties.push(new Property('locale', this.tagValue(xmlCur, 'locale')));
            data.component.properties.push(new Property('code', this.tagValue(xmlCur, 'code') !== '' ? this.tagValue(xmlCur, 'code') : 'EUR'));
            data.component.properties.push(new Property('fractionSize', (this.parseNumberValue(xmlCur, 'fractionSize') !== undefined ? this.parseNumberValue(xmlCur, 'fractionSize') : 2)?.toString() ?? ''));
        }
    }

    public parseNumberValue(element: Element | null, name: string): number | undefined {
        if (!element)
            return undefined;
        const value = parseInt(this.tagValue(element, name), 10);
        return isNaN(value) ? undefined : value;
    }

    public parseExpression(xmlTag: Element | null, name: string): Expression | undefined {
        if (!xmlTag)
            return undefined;
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
