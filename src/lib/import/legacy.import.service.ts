// noinspection DuplicatedCode

import {
    Arc,
    AssignPolicy,
    Breakpoint,
    CaseEvent,
    CaseEventType,
    Component,
    DataEvent,
    DataEventType,
    DataType,
    DataVariable,
    Expression,
    FinishPolicy,
    FlexContainer,
    I18nString,
    I18nTranslations,
    I18nWithDynamic,
    InhibitorArc,
    NodeElement,
    Option,
    PetriNet,
    Place,
    ProcessEvent,
    ProcessEventType,
    ProcessPermissionRef,
    ReadArc,
    RegularPlaceTransitionArc,
    RegularTransitionPlaceArc,
    ResetArc,
    Role,
    RoleEvent,
    RoleEventType,
    Transition,
    TransitionEvent,
    TransitionEventType,
    TransitionPermissionRef,
    Validation,
    XmlArcType
} from '../model';
import {ImportService} from './import.service';
import {LegacyImportUtils} from './legacy.import.utils';
import {PetriNetResult} from './petri-net-result';

export class LegacyImportService {

    constructor(protected importUtils: LegacyImportUtils = new LegacyImportUtils()) {
    }

    public importFromXml(xmlDoc: Document, result: PetriNetResult): PetriNetResult {
        result.model = new PetriNet();

        this.importModel(result, xmlDoc);
        this.importRoles(result, xmlDoc);
        this.importFunctions(result, xmlDoc);
        this.importEvents(result, xmlDoc);
        this.importData(result, xmlDoc);
        this.importTransitions(result, xmlDoc);
        this.importProcessRefs(result, xmlDoc);
        this.importPlaces(result, xmlDoc);
        this.importArcs(result, xmlDoc);
        this.importI18n(result, xmlDoc);

        this.checkI18ns(result);

        result.addInfo(`Process ${result.model.id} was migrated to Petriflow v2.0.0 specification.`)

        return result;
    }

    public importModel(modelResult: PetriNetResult, xmlDoc: Document): void {
        try {
            modelResult.model.id = this.importUtils.tagValue(xmlDoc, 'id');
            modelResult.model.version = this.importUtils.tagValue(xmlDoc, 'version');
            if (modelResult.model.version === undefined || modelResult.model.version.trim().length === 0) {
                modelResult.model.version = '1.0.0';
            }
            modelResult.model.icon = this.importUtils.tagValue(xmlDoc, 'icon');
            modelResult.model.defaultRole = this.importUtils.tagValue(xmlDoc, 'defaultRole') === '' ? ImportService.DEFAULT_ROLE_DEFAULT_VALUE : this.importUtils.tagValue(xmlDoc, 'defaultRole') === 'true';
            modelResult.model.anonymousRole = this.importUtils.tagValue(xmlDoc, 'anonymousRole') === '' ? ImportService.ANONYMOUS_ROLE_DEFAULT_VALUE : this.importUtils.tagValue(xmlDoc, 'anonymousRole') === 'true';
            modelResult.model.title = this.importUtils.parseI18n(xmlDoc, 'title');
            modelResult.model.caseName = this.importUtils.parseI18nWithDynamic(xmlDoc, 'caseName');
            this.importUtils.parseTags(xmlDoc, modelResult.model.properties);

            const initials = this.importUtils.tagValue(xmlDoc, 'initials');
            if (initials !== undefined && initials.trim().length > 0) {
                modelResult.model.properties.set('initials', initials);
            }
        } catch (e: unknown) {
            modelResult.addError('Error happened during the importing model properties: ' + (e as Error).toString(), e as Error);
        }
    }

    public importRoles(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlRole of Array.from(xmlDoc.getElementsByTagName('role'))) {
            try {
                const role = new Role(this.importUtils.tagValue(xmlRole, 'id'));
                this.parseRole(modelResult.model, xmlRole, role);
            } catch (e: unknown) {
                modelResult.addError('Error happened during the importing role [' + this.importUtils.tagValue(xmlRole, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public parseRole(model: PetriNet, xmlRole: Element, role: Role): void {
        let title = this.importUtils.parseI18n(xmlRole, 'title');
        if (title.value === undefined || title.value === '') {
            title = this.importUtils.parseI18n(xmlRole, 'name');
        }
        role.title = title;
        for (const xmlEvent of Array.from(xmlRole.getElementsByTagName('event'))) {
            const event = new RoleEvent(this.importUtils.tagAttribute(xmlEvent, 'type') as RoleEventType, '');
            event.message = this.importUtils.parseI18n(xmlEvent, 'message');
            event.title = this.importUtils.parseI18n(xmlEvent, 'title');
            this.importUtils.parseEvent(xmlEvent, event);
            role.mergeEvent(event);
        }
        model.addRole(role);
    }

    public importFunctions(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlFunction of Array.from(xmlDoc.getElementsByTagName('function'))) {
            try {
                modelResult.model.addFunction(this.importUtils.parseFunction(xmlFunction));
            } catch (e: unknown) {
                modelResult.addError('An error has occurred during the function import: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public importEvents(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlEvent of Array.from(xmlDoc.getElementsByTagName('processEvents'))) {
            for (const xmlBasicEvent of Array.from(xmlEvent.getElementsByTagName('event'))) {
                try {
                    const event = new ProcessEvent(this.importUtils.tagAttribute(xmlBasicEvent, 'type') as ProcessEventType, '');
                    this.importUtils.parseEvent(xmlBasicEvent, event);
                    modelResult.model.addProcessEvent(event);
                } catch (e: unknown) {
                    modelResult.addError('Error happened during the importing process event: ' + (e as Error).toString(), e as Error);
                }
            }
        }
        for (const xmlEvent of Array.from(xmlDoc.getElementsByTagName('caseEvents'))) {
            for (const xmlBasicEvent of Array.from(xmlEvent.getElementsByTagName('event'))) {
                try {
                    const event = new CaseEvent(this.importUtils.tagAttribute(xmlBasicEvent, 'type') as CaseEventType, '');
                    this.importUtils.parseEvent(xmlBasicEvent, event);
                    modelResult.model.addCaseEvent(event);
                } catch (e: unknown) {
                    modelResult.addError('Error happened during the importing case event: ' + (e as Error).toString(), e as Error);
                }
            }
        }
    }

    public importData(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlData of Array.from(xmlDoc.getElementsByTagName('data'))) {
            try {
                const id = this.importUtils.tagValue(xmlData, 'id');
                const type = this.importUtils.tagAttribute(xmlData, 'type') as DataType;
                const data = new DataVariable(id, type);
                this.parseData(modelResult, xmlData, data);
            } catch (e) {
                modelResult.addError('Error happened during the importing data [' + this.importUtils.tagValue(xmlData, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public parseData(result: PetriNetResult, xmlData: Element, data: DataVariable): void {
        const model = result.model;
        data.title = this.importUtils.parseI18n(xmlData, 'title');
        data.placeholder = this.importUtils.parseI18n(xmlData, 'placeholder');
        data.desc = this.importUtils.parseI18n(xmlData, 'desc');
        data.immediate = this.importUtils.tagAttribute(xmlData, 'immediate') === 'true';
        data.encryption = this.importUtils.parseEncryption(xmlData);
        data.init = this.importUtils.resolveInit(xmlData);
        if (data.init === undefined && xmlData.getElementsByTagName('inits')) {
            result.addWarning(`Could not migrate inits of data variable ${data.id}`);
        }
        const length = this.importUtils.parseNumberValue(xmlData, 'length');
        if (length !== undefined) {
            result.addInfo(`Length of ${data.id} migrated to properties`);
        }
        data.component = this.importUtils.parseViewAndComponent(xmlData);
        this.importUtils.resolveFormat(xmlData, data);
        if (xmlData.getElementsByTagName('remote').length > 0) {
            data.properties.set('remote', 'true');
            result.addInfo(`Remote of ${data.id} migrated to properties`);
        }

        const values = Array.from(xmlData.getElementsByTagName('values'));
        // transform <values>area</values>
        if (values.length === 1 && values[0].innerHTML === 'area' && data.type === DataType.TEXT) {
            if (!data.component) {
                data.component = new Component('area');
                result.addInfo(`Tag <values>area</values> of field ${data.id} changed to component`);
            }
        } else if (values.length > 0) {
            // transform <values> to <options>
            for (const val of values) {
                if (val.childNodes[0] !== undefined) {
                    const option = new Option();
                    const nodeValue = !val.childNodes[0].nodeValue ? '' : val.childNodes[0].nodeValue;
                    const i18nName = val.getAttribute('name');
                    option.value = new I18nWithDynamic(nodeValue);
                    option.value.id = !i18nName ? undefined : i18nName;
                    option.key = nodeValue;
                    data.options.push(option);
                }
            }
            result.addInfo(`Values of field ${data.id} changed to options`);
        }

        if (xmlData.getElementsByTagName('options').length > 0) {
            for (const val of Array.from(xmlData.getElementsByTagName('options')[0]?.getElementsByTagName('option'))) {
                const key = val.getAttribute('key') ?? '';
                const value = new I18nString(val.innerHTML);
                value.id = val.getAttribute('name') ?? '';
                data.options.push(Option.of(key, value));
            }
            // TODO: PF-75
            // data.optionsInit = this.importUtils.parseExpression(xmlData.getElementsByTagName('options')[0], 'init');
        }
        const valid = this.importUtils.tagValue(xmlData, 'valid');
        if (valid !== '') {
            const validation = new Validation();
            validation.expression = new Expression(valid, xmlData.getElementsByTagName('valid')?.item(0)?.getAttribute('dynamic') === 'true');
            data.validations.push(validation);
            result.addInfo(`Tags <valid> of field ${data.id} changed to validations`);
        }
        if (xmlData.getElementsByTagName('validations').length > 0) {
            for (const val of Array.from(xmlData.getElementsByTagName('validations')[0]?.children)) {
                const validation = new Validation();
                validation.expression = new Expression(this.importUtils.tagValue((val as HTMLDataElement), 'expression'), val.getAttribute('dynamic') === 'true');
                validation.message = this.importUtils.parseI18n((val as HTMLDataElement), 'message');
                data.validations.push(validation);
            }
        }
        if (Array.from(xmlData.getElementsByTagName('actionRef')).length > 0) {
            result.addInfo(`Action refs are ignored during migration`);
        }
        for (const xmlEvent of Array.from(xmlData.getElementsByTagName('event'))) {
            const event = new DataEvent(this.importUtils.tagAttribute(xmlEvent, 'type') as DataEventType, '');
            this.importUtils.parseEvent(xmlEvent, event);
            data.mergeEvent(event);
        }
        const actionTags = Array.from(xmlData.getElementsByTagName('action'));
        if (actionTags.length > 0) {
            let converted = 0;
            for (const actionTag of actionTags) {
                const actionTrigger = actionTag.getAttribute('trigger') as DataEventType;
                if (!actionTrigger) {
                    continue;
                }
                const action = this.importUtils.parseAction(actionTag, data.id);
                data.addAction(action, actionTrigger, undefined, `${data.id}_${actionTrigger}`);
                converted += 1;
            }
            if (converted > 0) {
                result.addInfo(`${converted} action${converted > 1 ? 's' : ''} of data variable ${data.id} converted into event actions`);
            }
        }
        if (xmlData.getElementsByTagName('allowedNets').length > 0) {
            for (const val of Array.from(xmlData.getElementsByTagName('allowedNets')[0]?.children)) {
                data.allowedNets.push(val.innerHTML);
            }
        }
        model.addData(data);
    }

    public importTransitions(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlTrans of Array.from(xmlDoc.getElementsByTagName('transition'))) {
            const id = this.importUtils.tagValue(xmlTrans, 'id');
            try {
                const xx = this.importUtils.parseNumberValue(xmlTrans, 'x') ?? 0;
                const yy = this.importUtils.parseNumberValue(xmlTrans, 'y') ?? 0;
                const trans = new Transition(xx, yy, id);
                this.parseTransition(modelResult, xmlTrans, trans);
            } catch (e) {
                modelResult.addError('Importing transition [' + id + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public parseTransition(result: PetriNetResult, xmlTrans: Element, trans: Transition): void {
        result.model.addTransition(trans);

        this.importTransitionMetadata(xmlTrans, trans, result);
        this.importTransitionRoleRefs(xmlTrans, trans, result);
        this.importTransitionUserRefs(xmlTrans, trans, result);
        this.importTransitionDataGroups(xmlTrans, trans, result);
        this.importTransitionTriggers(xmlTrans, trans, result);
        this.importTransitionEvents(xmlTrans, trans, result);
        this.importUtils.parseTags(xmlTrans, trans.properties);
    }

    private importTransitionRoleRefs(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            for (const xmlRoleRef of Array.from(xmlTrans.getElementsByTagName('roleRef'))) {
                trans.roleRefs.push(this.importUtils.parseRoleRef(xmlRoleRef));
            }
        } catch (e) {
            result.addError('Importing transition role refs failed', e as Error);
        }
    }

    private importTransitionUserRefs(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            /* @deprecated 'Array.from(xmlTrans.getElementsByTagName('usersRef'))' is deprecated and will be removed in future versions. */
            const userRefs = Array.from(xmlTrans.getElementsByTagName('usersRef')).concat(Array.from(xmlTrans.getElementsByTagName('userRef')));
            for (const xmlUserRef of userRefs) {
                const xmlUserRefLogic = xmlUserRef.getElementsByTagName('logic')[0];
                const userRef = new TransitionPermissionRef(this.importUtils.tagValue(xmlUserRef, 'id'));
                this.importUtils.resolveLogic(xmlUserRefLogic, userRef);
                trans.roleRefs.push(userRef);
            }
            result.addInfo(`Transition ${trans.id} user refs migrated to role refs`);
        } catch (e) {
            result.addError('Importing transition user refs failed', e as Error);
        }
    }

    private importTransitionTriggers(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            for (const xmlTrigger of Array.from(xmlTrans.getElementsByTagName('trigger'))) {
                trans.triggers.push(this.importUtils.parseTrigger(xmlTrigger));
            }
        } catch (e) {
            result.addError('Importing transition triggers failed', e as Error);
        }
    }

    private importTransitionDataGroups(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            const flex = new FlexContainer(`${trans.id}_flex`);
            for (const xmlDataGroup of Array.from(xmlTrans.getElementsByTagName('dataGroup'))) {
                try {
                    const flexItems = this.importUtils.parseDataGroup(xmlDataGroup);
                    for (const flexItem of flexItems) {
                        flex.items.push(flexItem);
                    }
                } catch (e) {
                    result.addError(`Importing data group '${trans.id}' failed`, e as Error);
                }
            }
            const xmlDataRefs = Array.from(xmlTrans.getElementsByTagName('dataRef'));
            if (Array.from(xmlTrans.getElementsByTagName('dataGroup')).length === 0 && xmlDataRefs.length > 0) {
                for (let i = 0; i < xmlDataRefs.length; i++) {
                    const xmlDataRef = xmlDataRefs[i];
                    if (xmlDataRef?.parentElement?.tagName !== 'transition') {
                        continue;
                    }
                    flex.items.push(this.importUtils.parseDataRef(xmlDataRef));
                }
            }
            trans.flex = flex;
        } catch (e) {
            result.addError('Importing transition data groups failed', e as Error);
        }
    }

    private importTransitionMetadata(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            if (this.importUtils.checkLengthAndNodes(xmlTrans, 'label')) {
                trans.title = this.importUtils.parseI18n(xmlTrans, 'label');
            }
            trans.icon = this.importUtils.tagValue(xmlTrans, 'icon');
            const priority = this.importUtils.tagValue(xmlTrans, 'priority');
            if (priority.length > 0) {
                trans.properties.set('priority', priority);
            }
            const assignPolicy = this.importUtils.tagValue(xmlTrans, 'assignPolicy');
            trans.assignPolicy = assignPolicy === '' ? AssignPolicy.MANUAL : (assignPolicy as AssignPolicy);
            const finishPolicy = this.importUtils.tagValue(xmlTrans, 'finishPolicy');
            trans.finishPolicy = finishPolicy === '' ? FinishPolicy.MANUAL : (finishPolicy as FinishPolicy);
        } catch (e) {
            result.addError('Importing transition metadata failed', e as Error);
        }
    }

    private importTransitionEvents(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            const events = Array.from(xmlTrans.getElementsByTagName('event'));
            events.forEach((xmlEvent, index) => {
                this.importTransitionEvent(xmlEvent, index, trans, result);
            });
        } catch (e) {
            result.addError('Importing transition events failed', e as Error);
        }
    }

    private importTransitionEvent(xmlEvent: Element, index: number, trans: Transition, result: PetriNetResult) {
        try {
            if (xmlEvent.parentElement?.tagName !== 'transition') {
                return;
            }
            let eventTypeName = this.importUtils.tagAttribute(xmlEvent, 'type');
            if (eventTypeName === 'delegate') {
                eventTypeName = TransitionEventType.REASSIGN;
            }
            const event = new TransitionEvent(eventTypeName as TransitionEventType, '');
            event.message = this.importUtils.parseI18n(xmlEvent, 'message');
            event.title = this.importUtils.parseI18n(xmlEvent, 'title');
            this.importUtils.parseEvent(xmlEvent, event);
            trans.eventSource.mergeEvent(event);
        } catch (e) {
            result.addError(`Importing transition event with index [${index} ${xmlEvent.id}] failed`, e as Error);
        }
    }

    public importProcessRefs(modelResult: PetriNetResult, xmlDoc: Document): void { // TODO: two methods
        for (const xmlRoleRef of Array.from(xmlDoc.getElementsByTagName('roleRef'))) {
            try {
                const xmlRoleRefLogic = xmlRoleRef.getElementsByTagName('caseLogic')[0];
                if (xmlRoleRefLogic !== undefined) {
                    let roleRefId = this.importUtils.tagValue(xmlRoleRef, 'id');
                    if (roleRefId === 'default') {
                        roleRefId = Role.DEFAULT;
                    }
                    const roleRef = new ProcessPermissionRef(roleRefId);
                    this.importUtils.resolveCaseLogic(xmlRoleRefLogic, roleRef);
                    modelResult.model.addRoleRef(roleRef);
                }
            } catch (e) {
                modelResult.addError('Error happened during the importing process role refs [' + this.importUtils.tagValue(xmlRoleRef, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
        /* 'Array.from(xmlDoc.getElementsByTagName('usersRef'))' is deprecated and will be removed in future versions. */
        const userRefs = Array.from(xmlDoc.getElementsByTagName('usersRef')).concat(Array.from(xmlDoc.getElementsByTagName('userRef')));
        for (const xmlUserRef of userRefs) {
            try {
                const xmlUserRefLogic = xmlUserRef.getElementsByTagName('caseLogic')[0];
                if (xmlUserRefLogic !== undefined) {
                    const userRef = new ProcessPermissionRef(this.importUtils.tagValue(xmlUserRef, 'id'));
                    this.importUtils.resolveCaseLogic(xmlUserRefLogic, userRef);
                    modelResult.model.addUserRef(userRef);
                }
            } catch (e) {
                modelResult.addError('Error happened during the importing process user refs  [' + this.importUtils.tagValue(xmlUserRef, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public importPlaces(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlPlace of Array.from(xmlDoc.getElementsByTagName('place'))) {
            try {
                this.importPlace(modelResult, xmlPlace);
            } catch (e) {
                modelResult.addError('Error happened during the importing places [' + this.importUtils.tagValue(xmlPlace, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    importPlace(modelResult: PetriNetResult, xmlPlace: Element) {
        const placeId = xmlPlace.getElementsByTagName('id')?.item(0)?.childNodes[0]?.nodeValue;
        if (!placeId) {
            throw new Error('Id of a place must be defined!');
        }
        let xx = this.importUtils.parseNumberValue(xmlPlace, 'x');
        let yy = this.importUtils.parseNumberValue(xmlPlace, 'y');
        if (xx === undefined || yy === undefined) {
            modelResult.addWarning(`Could not parse place coordinates [${xx}, ${yy}]`);
            xx = xx ?? 0;
            yy = yy ?? 0;
        }
        const scope = this.importUtils.parsePlaceStatic(xmlPlace);
        const place = new Place(xx, yy, placeId);
        place.scope = scope;
        this.parsePlace(modelResult.model, xmlPlace, place);
    }

    public parsePlace(model: PetriNet, xmlPlace: Element, place: Place): void {
        model.addPlace(place);
        place.marking = this.importUtils.parseNumberValue(xmlPlace, 'tokens') ?? 0;
        if (xmlPlace.getElementsByTagName('label').length > 0 &&
            xmlPlace.getElementsByTagName('label')[0].childNodes.length !== 0) {
            place.title = this.importUtils.parseI18n(xmlPlace, 'label');
        }
    }

    public importArcs(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlArc of Array.from(xmlDoc.getElementsByTagName('arc'))) {
            try {
                const arc = this.parseArc(modelResult, xmlArc);
                modelResult.model.addArc(arc);
            } catch (e) {
                modelResult.addError('Error happened during the importing arcs [' + this.importUtils.tagValue(xmlArc, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public parseArc(result: PetriNetResult, xmlArc: Element): Arc<NodeElement, NodeElement> {
        const arcId = xmlArc.getElementsByTagName('id')?.item(0)?.childNodes[0]?.nodeValue;
        if (!arcId) {
            throw new Error('Id of an arc must be defined!');
        }
        const source = xmlArc.getElementsByTagName('sourceId')?.item(0)?.childNodes[0]?.nodeValue;
        if (!source) {
            throw new Error('Source of an arc must be defined!');
        }
        const target = xmlArc.getElementsByTagName('destinationId')?.item(0)?.childNodes[0]?.nodeValue;
        if (!target) {
            throw new Error('Target of an arc must be defined!');
        }
        const parsedArcType = this.importUtils.parseArcType(xmlArc);
        const arc = this.resolveArc(source, target, parsedArcType, arcId, result);
        const multiplicity = this.importUtils.parseNumberValue(xmlArc, 'multiplicity');
        arc.multiplicity = new Expression(`${multiplicity}` ?? '0');
        if (parsedArcType as string === 'variable') {
            this.importUtils.checkVariability(result, arc, xmlArc.getElementsByTagName('multiplicity')[0]?.childNodes[0]?.nodeValue ?? undefined);
            result.addInfo(`Variable arc '${arc.id}' converted to regular with data field reference`);
        } else if (this.importUtils.checkLengthAndNodes(xmlArc, 'reference')) {
            const arcReference = xmlArc.getElementsByTagName('reference')[0].childNodes[0].nodeValue ?? undefined;
            this.importUtils.checkVariability(result, arc, arcReference);
        }

        this.importBreakPoints(xmlArc, arc, result);
        return arc;
    }

    resolveArc(source: string, target: string, parsedArcType: XmlArcType, arcId: string, result: PetriNetResult): Arc<NodeElement, NodeElement> {
        // TODO: refactor
        let place, transition;
        switch (parsedArcType) {
            case XmlArcType.INHIBITOR:
                [place, transition] = this.getPlaceTransition(result, source, target, arcId);
                return new InhibitorArc(place, transition, arcId);
            case XmlArcType.RESET:
                [place, transition] = this.getPlaceTransition(result, source, target, arcId);
                return new ResetArc(place, transition, arcId);
            case XmlArcType.READ:
                [place, transition] = this.getPlaceTransition(result, source, target, arcId);
                return new ReadArc(place, transition, arcId);
            case XmlArcType.REGULAR:
            case 'variable' as XmlArcType:
                if (result.model.getPlace(source)) {
                    [place, transition] = this.getPlaceTransition(result, source, target, arcId);
                    return new RegularPlaceTransitionArc(place, transition, arcId);
                } else {
                    [place, transition] = this.getPlaceTransition(result, target, source, arcId);
                    return new RegularTransitionPlaceArc(transition, place, arcId);
                }
        }
        throw new Error(`Unknown type ${parsedArcType}`);
    }

    getPlaceTransition(result: PetriNetResult, placeId: string, transitionId: string, arcId: string): [Place, Transition] {
        const place = result.model.getPlace(placeId);
        const transition = result.model.getTransition(transitionId);
        if (place === undefined || transition === undefined) {
            throw new Error(`Could not find nodes ${placeId}->${transitionId}  of arc ${arcId}`);
        }
        return [place, transition];
    }

    importBreakPoints(xmlArc: Element, arc: Arc<NodeElement, NodeElement>, result: PetriNetResult) {
        ['breakpoint', 'breakPoint'].forEach(breakPointName => {
            if (xmlArc.getElementsByTagName(breakPointName).length > 0) {
                Array.from(xmlArc.getElementsByTagName(breakPointName)).forEach((breakpoint) => {
                    const xx = this.importUtils.parseNumberValue(breakpoint, 'x');
                    const yy = this.importUtils.parseNumberValue(breakpoint, 'y');
                    if (xx && yy) {
                        arc.breakpoints.push(new Breakpoint(xx, yy));
                    } else {
                        const message = `Could not parse breakpoint coordinates [${xx}, ${yy}]`;
                        result.addError(message, new Error(message));
                    }
                });
            }
        });
    }

    public importI18n(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlI18n of Array.from(xmlDoc.getElementsByTagName('i18n'))) {
            try {
                const locale = this.importUtils.tagAttribute(xmlI18n, 'locale');
                const i18nNode = new I18nTranslations(locale);
                this.parseI18n(modelResult, xmlI18n, i18nNode);
            } catch (e) {
                modelResult.addError('Error happened during the importing i18n [' + this.importUtils.tagAttribute(xmlI18n, 'locale') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public parseI18n(result: PetriNetResult, xmlI18n: Element, i18nNode: I18nTranslations): void {
        const xmlI18strings = xmlI18n.getElementsByTagName('i18nString');
        for (const xmlI18string of Array.from(xmlI18strings)) {
            const name = this.importUtils.tagAttribute(xmlI18string, 'name');
            try {
                const translation = xmlI18string.innerHTML;
                i18nNode.addI18n(new I18nString(translation, name));
            } catch (e) {
                result.addError(`Importing i18n string '${name}' failed`, e as Error);
            }
        }
        result.model.addI18n(i18nNode);
    }

    private checkI18ns(modelResult: PetriNetResult) {
        const model = modelResult.model;
        model.getI18ns().forEach(i18ns => {
            this.checkI18n(model.title, i18ns, modelResult);
            model.getRoles().forEach(r => {
                this.checkI18n(r.title, i18ns, modelResult);
            });
            model.getDataSet().forEach(d => {
                this.checkI18n(d.title, i18ns, modelResult);
                this.checkI18n(d.placeholder, i18ns, modelResult);
                this.checkI18n(d.desc, i18ns, modelResult);
                d.options.forEach(o => {
                    this.checkI18n(o.value, i18ns, modelResult);
                });
                d.validations?.forEach(v => {
                    this.checkI18n(v.message, i18ns, modelResult);
                });
            });
            model.getTransitions().forEach(t => {
                this.checkI18n(t.title, i18ns, modelResult);
                t.eventSource.getEvents().forEach(e => {
                    this.checkI18n(e.title, i18ns, modelResult);
                    this.checkI18n(e.message, i18ns, modelResult);
                });
            });
            model.getPlaces().forEach(p => {
                this.checkI18n(p.title, i18ns, modelResult);
            });
        });
    }

    private checkI18n(s: I18nString | undefined, i18ns: I18nTranslations, modelResult: PetriNetResult) {
        if (s && s.id) {
            const i18n = i18ns.getI18n(s.id);
            if (!i18n) {
                modelResult.addWarning(`I18n string with name ${s.id} has no translation in locale ${i18ns.locale}`);
            }
        }
    }
}
