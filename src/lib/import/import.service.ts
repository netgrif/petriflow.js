import {
    Arc, ArcType,
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
    FunctionScope,
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
    Validation
} from '../model';
import {ImportUtils} from './import-utils';
import {PetriNetResult} from './petri-net-result';

export class ImportService {

    /* cspell:disable-next-line */
    private static readonly PARSE_ERROR_LINE_EXTRACTION_REGEX = '(?:L|l)ine.*?(\\d+).*?(?:C|c)olumn.*?(\\d+)';
    private static readonly DEFAULT_ROLE_DEFAULT_VALUE = false;
    private static readonly ANONYMOUS_ROLE_DEFAULT_VALUE = false;

    constructor(protected importUtils: ImportUtils = new ImportUtils()) {
    }

    private parseXml(txt: string): Document {
        let xmlDoc = new Document();
        if (window.DOMParser) {
            const parser = new DOMParser();
            xmlDoc = parser.parseFromString(txt, 'text/xml');
        }
        return xmlDoc;
    }

    public parseFromXml(txt: string, parentModel?: PetriNet): PetriNetResult {
        const doc = this.parseXml(txt);
        const result: PetriNetResult = this.parseFromDocument(doc, parentModel);
        result.model.merge();
        return result;
    }

    public parseMultipleFromXml(xmlPetriNets: string[]): Map<string, PetriNetResult> {
        const result = this.recursiveParseMultipleFromDocument(xmlPetriNets.map(xmlNet => this.parseXml(xmlNet)));
        result.forEach((element: PetriNetResult) => {
            element.model.merge();
        })
        return result;
    }

    private recursiveParseMultipleFromDocument(documentPetriNets: Document[], results: Map<string, PetriNetResult> = new Map<string, PetriNetResult>()) {
        const netsToReimport: Document[] = [];
        for (const xmlDoc of documentPetriNets) {
            const identifier = this.importUtils.parseIdentifierFromChildElement(xmlDoc, 'id');
            if (results.has(identifier)) {
                continue;
            }

            const extension = this.importUtils.parseExtension(xmlDoc);
            if (extension === undefined) {
                const petriNetResult = this.parseFromDocument(xmlDoc);
                results.set(petriNetResult.model.id, petriNetResult);
                continue;
            }

            if (results.has(extension.id)) {
                const petriNetResult = this.parseFromDocument(xmlDoc, results.get(extension.id)?.model);
                petriNetResult.model.parentModel = results.get(extension.id)?.model;
                results.set(petriNetResult.model.id, petriNetResult);
                continue;
            }
            netsToReimport.push(xmlDoc);
        }

        if (netsToReimport.length > 0) {
            this.recursiveParseMultipleFromDocument(netsToReimport, results);
        }
        return results;
    }

    private parseFromDocument(doc: Document, parentModel?: PetriNet): PetriNetResult {
        const parseError = doc.getElementsByTagName('parsererror'); // cspell:disable-line
        let result = new PetriNetResult();

        if (parseError.length !== 0) {
            let matches = parseError.item(0)?.textContent?.match(ImportService.PARSE_ERROR_LINE_EXTRACTION_REGEX);
            matches = !matches ? null : matches;
            let message;

            if (!matches || matches.length === 0) {
                message = parseError.item(0)?.textContent;
            } else {
                message = `XML parsing error at line ${matches[1]} column ${matches[2]}`;
            }

            result.errors.push(!message ? '' : message);
            return result;
        }

        result = this.importFromXml(doc, result, parentModel);
        this.importUtils.resetIds();
        return result;
    }

    private importFromXml(xmlDoc: Document, result: PetriNetResult, parentModel?: PetriNet): PetriNetResult { // TODO: return stream
        result.model = new PetriNet();

        this.importModel(result, xmlDoc, parentModel);
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

        return result;
    }

    public importModel(modelResult: PetriNetResult, xmlDoc: Document, parentModel?: PetriNet): void {
        try {
            modelResult.model.id = this.importUtils.parseIdentifierFromChildElement(xmlDoc, 'id');
            modelResult.model.version = this.importUtils.tagValue(xmlDoc, 'version');
            modelResult.model.icon = this.importUtils.tagValue(xmlDoc, 'icon');
            modelResult.model.defaultRole = this.importUtils.tagValue(xmlDoc, 'defaultRole') === '' ? ImportService.DEFAULT_ROLE_DEFAULT_VALUE : this.importUtils.tagValue(xmlDoc, 'defaultRole') === 'true';
            modelResult.model.anonymousRole = this.importUtils.tagValue(xmlDoc, 'anonymousRole') === '' ? ImportService.ANONYMOUS_ROLE_DEFAULT_VALUE : this.importUtils.tagValue(xmlDoc, 'anonymousRole') === 'true';
            modelResult.model.title = this.importUtils.parseI18n(xmlDoc, 'title');
            modelResult.model.caseName = this.importUtils.parseI18nWithDynamic(xmlDoc, 'caseName');
            modelResult.model.extends = this.importUtils.parseExtension(xmlDoc);
            if (parentModel) {
                modelResult.model.parentModel = parentModel;
            }
        } catch (e: unknown) {
            modelResult.addError('Error happened during the importing model properties: ' + (e as Error).toString(), e as Error);
        }
    }

    public importRoles(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlRole of Array.from(xmlDoc.getElementsByTagName('role'))) {
            try {
                const roleId = this.importUtils.parseIdentifierFromChildElement(xmlRole, 'id');
                const role = new Role(roleId);
                this.parseRole(modelResult.model, xmlRole, role);
            } catch (e: unknown) {
                modelResult.addError('Error happened during the importing role [' + this.importUtils.tagValue(xmlRole, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public parseRole(model: PetriNet, xmlRole: Element, role: Role): void {
        let title = this.importUtils.parseI18n(xmlRole, 'title');
        if (title.value === undefined || title.value === '') {
            title = this.importUtils.parseI18n(xmlRole, 'id');
        }
        role.title = title;
        for (const xmlEvent of Array.from(xmlRole.getElementsByTagName('event'))) {
            const event = new RoleEvent(this.importUtils.tagAttribute(xmlEvent, 'type') as RoleEventType, '');
            event.message = this.importUtils.parseI18n(xmlEvent, 'message');
            event.title = this.importUtils.parseI18n(xmlEvent, 'title');
            this.importUtils.parseEvent(xmlEvent, event);
            role.mergeEvent(event);
        }
        const scopeValue = this.importUtils.tagAttribute(xmlRole, 'scope');
        if (scopeValue !== '') {
            role.scope = scopeValue as FunctionScope;
        }
        role.properties = this.importUtils.parseProperties(xmlRole);
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

    public importEvents(modelResult: PetriNetResult, xmlDoc: Document): void { // TODO: refactor into two methods
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
                const id = this.importUtils.parseIdentifierFromChildElement(xmlData, 'id');
                const type = this.importUtils.tagAttribute(xmlData, 'type') as DataType;
                const data = new DataVariable(id, type);
                const scopeValue = this.importUtils.tagAttribute(xmlData, 'scope');
                if (scopeValue !== '') {
                    data.scope = scopeValue as FunctionScope;
                }
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
        data.component = this.importUtils.parseComponent(xmlData);
        data.properties = this.importUtils.parseProperties(xmlData);

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
                    const i18nName = val.getAttribute('id');
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
                value.id = val.getAttribute('id') ?? '';
                data.options.push(Option.of(key, value));
            }
        }
        if (xmlData.getElementsByTagName('validations').length > 0) {
            for (const val of Array.from(xmlData.getElementsByTagName('validations')[0]?.children)) {
                const validation = new Validation();
                validation.expression = new Expression(this.importUtils.tagValue((val as HTMLDataElement), 'expression'), val.getAttribute('dynamic') === 'true');
                validation.message = this.importUtils.parseI18n((val as HTMLDataElement), 'message');
                data.validations.push(validation);
            }
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
                const action = this.importUtils.parseAction(actionTag);
                data.addAction(action, actionTrigger);
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
            try {
                const id = this.importUtils.parseIdentifierFromChildElement(xmlTrans, 'id');
                const xx = this.importUtils.parseNumberValue(xmlTrans, 'x') ?? 0;
                const yy = this.importUtils.parseNumberValue(xmlTrans, 'y') ?? 0;
                const trans = new Transition(xx, yy, id);
                const scopeValue = this.importUtils.tagAttribute(xmlTrans, 'scope');
                if (scopeValue !== '') {
                    trans.scope = scopeValue as FunctionScope;
                }
                trans.scope = (xmlTrans.getAttribute('scope') ?? FunctionScope.USECASE) as FunctionScope;
                this.parseTransition(modelResult, xmlTrans, trans);
            } catch (e) {
                modelResult.addError('Importing transition [' + this.importUtils.tagValue(xmlTrans, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
    }

    public parseTransition(result: PetriNetResult, xmlTrans: Element, trans: Transition): void {
        result.model.addTransition(trans);

        this.importTransitionMetadata(xmlTrans, trans, result);
        this.importTransitionRoleRefs(xmlTrans, trans, result);
        this.importTransitionTriggers(xmlTrans, trans, result);
        this.importTransitionContent(xmlTrans, trans, result)
        this.importTransitionEvents(xmlTrans, trans, result);
    }

    public importTransitionContent(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            let transitionContentContainer = this.importUtils.getChildElementByName(xmlTrans.children, 'flex');
            if (transitionContentContainer) {
                trans.flex = this.importUtils.parseFlex(transitionContentContainer);
            }
            transitionContentContainer = this.importUtils.getChildElementByName(xmlTrans.children, 'grid');
            if (transitionContentContainer) {
                trans.grid = this.importUtils.parseGrid(transitionContentContainer);
            }
        } catch (e) {
            result.addError('Importing of transtion content failed', e as Error);
        }
    }

    private importTransitionRoleRefs(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        for (const xmlRoleRef of Array.from(xmlTrans.getElementsByTagName('roleRef'))) {
            try {
                trans.roleRefs.push(this.importUtils.parseRoleRef(xmlRoleRef));
            } catch (e) {
                result.addError('Importing transition role refs failed', e as Error);
            }
        }
    }

    private importTransitionTriggers(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        for (const xmlTrigger of Array.from(xmlTrans.getElementsByTagName('trigger'))) {
            try {
                trans.triggers.push(this.importUtils.parseTrigger(xmlTrigger));
            } catch (e) {
                result.addError('Importing transition triggers failed', e as Error);
            }
        }
    }

    private importTransitionMetadata(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            if (this.importUtils.checkLengthAndNodes(xmlTrans, 'title')) {
                trans.title = this.importUtils.parseI18n(xmlTrans, 'title');
            }
            trans.icon = this.importUtils.tagValue(xmlTrans, 'icon');
            const assignPolicy = this.importUtils.tagValue(xmlTrans, 'assignPolicy');
            trans.assignPolicy = assignPolicy === '' ? AssignPolicy.MANUAL : (assignPolicy as AssignPolicy);
            const finishPolicy = this.importUtils.tagValue(xmlTrans, 'finishPolicy');
            trans.finishPolicy = finishPolicy === '' ? FinishPolicy.MANUAL : (finishPolicy as FinishPolicy);
        } catch (e) {
            result.addError('Importing transition metadata failed', e as Error);
        }
    }

    private importTransitionEvents(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        const events = Array.from(xmlTrans.getElementsByTagName('event'));
        for (const xmlEvent of events) {
            try {
                this.importTransitionEvent(xmlEvent, events.indexOf(xmlEvent), trans, result);
            } catch (e) {
                result.addError('Importing transition events failed', e as Error);
            }
        }
    }

    private importTransitionEvent(xmlEvent: Element, index: number, trans: Transition, result: PetriNetResult) {
        try {
            if (xmlEvent.parentElement?.tagName !== 'transition') {
                return;
            }
            const event = new TransitionEvent(this.importUtils.tagAttribute(xmlEvent, 'type') as TransitionEventType, '');
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
                if (xmlRoleRefLogic === undefined) {
                    continue;
                }
                const roleRef = new ProcessPermissionRef(this.importUtils.parseIdentifierFromChildElement(xmlRoleRef, 'id'));
                this.importUtils.resolveCaseLogic(xmlRoleRefLogic, roleRef);
                modelResult.model.addRoleRef(roleRef);
            } catch (e) {
                modelResult.addError('Error happened during the importing process role refs [' + this.importUtils.tagValue(xmlRoleRef, 'id') + ']: ' + (e as Error).toString(), e as Error);
            }
        }
        /* 'Array.from(xmlDoc.getElementsByTagName('usersRef'))' is deprecated and will be removed in future versions. */
        const userRefs = Array.from(xmlDoc.getElementsByTagName('usersRef')).concat(Array.from(xmlDoc.getElementsByTagName('userRef')));
        for (const xmlUserRef of userRefs) {
            try {
                const xmlUserRefLogic = xmlUserRef.getElementsByTagName('caseLogic')[0];
                if (xmlUserRefLogic === undefined) {
                    continue;
                }
                const userRef = new ProcessPermissionRef(this.importUtils.parseIdentifierFromChildElement(xmlUserRef, 'id'));
                this.importUtils.resolveCaseLogic(xmlUserRefLogic, userRef);
                modelResult.model.addUserRef(userRef);
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
        const placeId = this.importUtils.parseIdentifierFromChildElement(xmlPlace, 'id');
        let xx = this.importUtils.parseNumberValue(xmlPlace, 'x');
        let yy = this.importUtils.parseNumberValue(xmlPlace, 'y');
        if (xx === undefined || yy === undefined) {
            modelResult.addWarning(`Could not parse place coordinates [${xx}, ${yy}]`);
            xx = xx ?? 0;
            yy = yy ?? 0;
        }
        const isStatic = this.importUtils.parsePlaceStatic(xmlPlace);
        const place = new Place(xx, yy, isStatic, placeId);
        const scopeValue = this.importUtils.tagAttribute(xmlPlace, 'scope');
        if (scopeValue !== '') {
            place.scope = scopeValue as FunctionScope;
        }
        this.parsePlace(modelResult.model, xmlPlace, place);
    }

    public parsePlace(model: PetriNet, xmlPlace: Element, place: Place): void {
        model.addPlace(place);
        place.marking = this.importUtils.parseNumberValue(xmlPlace, 'tokens') ?? 0;
        place.properties = this.importUtils.parseProperties(xmlPlace)
        if (xmlPlace.getElementsByTagName('title').length > 0 &&
            xmlPlace.getElementsByTagName('title')[0].childNodes.length !== 0) {
            place.title = this.importUtils.parseI18n(xmlPlace, 'title');
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
        const arcId = this.importUtils.parseIdentifierFromChildElement(xmlArc, 'id');
        const source = xmlArc.getElementsByTagName('sourceId')?.item(0)?.childNodes[0]?.nodeValue;
        if (!source && result.model.extends === undefined) {
            throw new Error('Source of an arc must be defined!');
        }
        const target = xmlArc.getElementsByTagName('destinationId')?.item(0)?.childNodes[0]?.nodeValue;
        if (!target && result.model.extends === undefined) {
            throw new Error('Target of an arc must be defined!');
        }
        const parsedArcType = this.importUtils.parseArcType(xmlArc);
        const arc = this.resolveArc(source as string, target as string, parsedArcType, arcId, result);
        const scopeValue = this.importUtils.tagAttribute(xmlArc, 'scope');
        if (scopeValue !== '') {
            arc.scope = scopeValue as FunctionScope;
        }
        arc.multiplicity = this.importUtils.parseExpression(xmlArc, 'multiplicity') ?? new Expression('1');
        this.importBreakPoints(xmlArc, arc, result);
        return arc;
    }

    resolveArc(source: string, target: string, parsedArcType: ArcType, arcId: string, result: PetriNetResult): Arc<NodeElement, NodeElement> {
        // TODO: refactor
        let place, transition;
        switch (parsedArcType) {
            case ArcType.INHIBITOR:
                [place, transition] = this.getPlaceTransition(result, source, target, arcId);
                return new InhibitorArc(place, transition, arcId);
            case ArcType.RESET:
                [place, transition] = this.getPlaceTransition(result, source, target, arcId);
                return new ResetArc(place, transition, arcId);
            case ArcType.READ:
                [place, transition] = this.getPlaceTransition(result, source, target, arcId);
                return new ReadArc(place, transition, arcId);
            case ArcType.REGULAR_PT:
                [place, transition] = this.getPlaceTransition(result, source, target, arcId);
                return new RegularPlaceTransitionArc(place, transition, arcId);
            case ArcType.REGULAR_TP:
                [place, transition] = this.getPlaceTransition(result, target, source, arcId);
                return new RegularTransitionPlaceArc(transition, place, arcId);
        }
        throw new Error(`Unknown type ${parsedArcType}`);
    }

    getPlaceTransition(result: PetriNetResult, placeId: string, transitionId: string, arcId: string): [Place, Transition] {
        let place = result.model.getPlace(placeId);
        let transition = result.model.getTransition(transitionId);
        if (!result.model.extends && (place === undefined || transition === undefined)) {
            throw new Error(`Could not find nodes ${placeId}->${transitionId}  of arc ${arcId}`);
        }
        if (place === undefined) {
            place = new Place(-1, -1, false, placeId);
        }
        if (transition === undefined) {
            transition = new Transition(-1, -1, transitionId);
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
            const id = this.importUtils.tagAttribute(xmlI18string, 'id');
            try {
                const translation = xmlI18string.innerHTML;
                i18nNode.addI18n(new I18nString(translation, id));
            } catch (e) {
                result.addError(`Importing i18n string '${id}' failed`, e as Error);
            }
        }
        result.model.addI18n(i18nNode);
    }

    private checkI18ns(modelResult: PetriNetResult) {
        const model = modelResult.model;
        model.getI18ns().forEach(i18ns => {
            ImportService.checkI18n(model.title, i18ns, modelResult);
            model.getRoles().forEach(r => {
                ImportService.checkI18n(r.title, i18ns, modelResult);
            });
            model.getDataSet().forEach(d => {
                ImportService.checkI18n(d.title, i18ns, modelResult);
                ImportService.checkI18n(d.placeholder, i18ns, modelResult);
                ImportService.checkI18n(d.desc, i18ns, modelResult);
                d.options.forEach(o => {
                    ImportService.checkI18n(o.value, i18ns, modelResult);
                });
                d.validations?.forEach(v => {
                    ImportService.checkI18n(v.message, i18ns, modelResult);
                });
            });
            model.getTransitions().forEach(t => {
                ImportService.checkI18n(t.title, i18ns, modelResult);
                t.eventSource.getEvents().forEach(e => {
                    ImportService.checkI18n(e.title, i18ns, modelResult);
                    ImportService.checkI18n(e.message, i18ns, modelResult);
                });
            });
            model.getPlaces().forEach(p => {
                ImportService.checkI18n(p.title, i18ns, modelResult);
            });
        });
    }

    private static checkI18n(s: I18nString | undefined, i18ns: I18nTranslations, modelResult: PetriNetResult) {
        if (s && s.id) {
            const i18n = i18ns.getI18n(s.id);
            if (!i18n) {
                modelResult.addWarning(`I18n string with name ${s.id} has no translation in locale ${i18ns.locale}`);
            }
        }
    }
}
