import {
    Alignment,
    Arc,
    ArcType,
    AssignedUser,
    AssignPolicy,
    Breakpoint,
    CaseEvent,
    CaseEventType,
    Component,
    DataEvent,
    DataEventType,
    DataFocusPolicy,
    DataGroup,
    DataType,
    DataVariable,
    Expression,
    FinishPolicy,
    I18nString,
    I18nTranslations,
    I18nWithDynamic,
    LayoutType,
    Mapping,
    Option,
    PetriNet,
    Place,
    ProcessEvent,
    ProcessEventType,
    ProcessRoleRef,
    ProcessUserRef,
    Role,
    RoleEvent,
    RoleEventType,
    Transaction,
    Transition,
    TransitionEvent,
    TransitionEventType,
    UserRef,
    Validation
} from '../model';
import {ImportUtils} from './import-utils';
import {PetriNetResult} from './petri-net-result';

export class ImportService {

    private static readonly PARSE_ERROR_LINE_EXTRACTION_REGEX = '(?:L|l)ine.*?(\\d+).*?(?:C|c)olumn.*?(\\d+)';

    constructor(protected importUtils: ImportUtils = new ImportUtils()) {
    }

    private parseXml(txt: string): Document {
        let xmlDoc;
        if (window.DOMParser) {
            const parser = new DOMParser();
            xmlDoc = parser.parseFromString(txt, 'text/xml');
        }
        return xmlDoc;
    }

    public parseFromXml(txt: string): PetriNetResult {
        const doc = this.parseXml(txt);
        const parseError = doc.getElementsByTagName('parsererror');
        const result = new PetriNetResult(undefined);

        if (parseError.length !== 0) {
            const matches = parseError.item(0).textContent.match(ImportService.PARSE_ERROR_LINE_EXTRACTION_REGEX);
            let message;

            if (matches.length === 0) {
                message = parseError.item(0).textContent;
            } else {
                message = `XML parsing error at line ${matches[1]} column ${matches[2]}`;
            }

            result.errors.push(message);
            return result;
        }

        return this.importFromXml(doc, result);
    }

    private importFromXml(xmlDoc: Document, result: PetriNetResult): PetriNetResult { // TODO: return stream
        result.model = new PetriNet();

        this.importModel(result, xmlDoc);
        this.importRoles(result, xmlDoc);
        this.importEvents(result, xmlDoc);
        this.importData(result, xmlDoc);
        this.importTransitions(result, xmlDoc);
        this.importTransactions(result, xmlDoc);
        this.importProcessRefs(result, xmlDoc);
        this.importPlaces(result, xmlDoc);
        this.importArcs(result, xmlDoc);
        this.importI18n(result, xmlDoc);
        this.importMapping(result, xmlDoc);

        this.checkI18ns(result);

        return result;
    }

    public importModel(modelResult: PetriNetResult, xmlDoc: Document): void {
        try {
            modelResult.model.id = this.importUtils.tagValue(xmlDoc, 'id');
            modelResult.model.version = this.importUtils.tagValue(xmlDoc, 'version');
            modelResult.model.initials = this.importUtils.tagValue(xmlDoc, 'initials');
            modelResult.model.icon = this.importUtils.tagValue(xmlDoc, 'icon');
            modelResult.model.defaultRole = this.importUtils.tagValue(xmlDoc, 'defaultRole') === '' ? undefined : this.importUtils.tagValue(xmlDoc, 'defaultRole') === 'true';
            modelResult.model.transitionRole = this.importUtils.tagValue(xmlDoc, 'transitionRole') === '' ? undefined : this.importUtils.tagValue(xmlDoc, 'transitionRole') === 'true';
            modelResult.model.title = this.importUtils.parseI18n(xmlDoc, 'title');
            modelResult.model.caseName = this.importUtils.parseI18nWithDynamic(xmlDoc, 'caseName');
        } catch (e) {
            modelResult.addError('Error happened during the importing model properties: ' + e.toString(), e);
        }
    }

    public importRoles(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlRole of Array.from(xmlDoc.getElementsByTagName('role'))) {
            try {
                const role = new Role(this.importUtils.tagValue(xmlRole, 'id'));
                this.parseRole(modelResult.model, xmlRole, role);
            } catch (e) {
                modelResult.addError('Error happened during the importing role [' + this.importUtils.tagValue(xmlRole, 'id') + ']: ' + e.toString(), e);
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
            const event = new RoleEvent(this.importUtils.tagAttribute(xmlEvent, 'type') as RoleEventType);
            event.message = this.importUtils.parseI18n(xmlEvent, 'message');
            event.title = this.importUtils.parseI18n(xmlEvent, 'title');
            this.importUtils.parseEvent(xmlEvent, event);
            role.mergeEvent(event);
        }
        model.addRole(role);
    }

    public importEvents(modelResult: PetriNetResult, xmlDoc: Document): void { // TODO: refactor to two methods
        for (const xmlEvent of Array.from(xmlDoc.getElementsByTagName('processEvents'))) {
            for (const xmlBasicEvent of Array.from(xmlEvent.getElementsByTagName('event'))) {
                try {
                    const event = new ProcessEvent(this.importUtils.tagAttribute(xmlBasicEvent, 'type') as ProcessEventType);
                    this.importUtils.parseEvent(xmlBasicEvent, event);
                    modelResult.model.addProcessEvent(event);
                } catch (e) {
                    modelResult.addError('Error happened during the importing process event: ' + e.toString(), e);
                }
            }
        }
        for (const xmlEvent of Array.from(xmlDoc.getElementsByTagName('caseEvents'))) {
            for (const xmlBasicEvent of Array.from(xmlEvent.getElementsByTagName('event'))) {
                try {
                    const event = new CaseEvent(this.importUtils.tagAttribute(xmlBasicEvent, 'type') as CaseEventType);
                    this.importUtils.parseEvent(xmlBasicEvent, event);
                    modelResult.model.addCaseEvent(event);
                } catch (e) {
                    modelResult.addError('Error happened during the importing case event: ' + e.toString(), e);
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
                modelResult.addError('Error happened during the importing data [' + this.importUtils.tagValue(xmlData, 'id') + ']: ' + e.toString(), e);
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
        this.importUtils.resolveInits(xmlData).forEach(i => data.inits.push(i));
        data.length = this.importUtils.parseNumberValue(xmlData, 'length');
        data.component = this.importUtils.parseViewAndComponent(xmlData);
        this.importUtils.resolveFormat(xmlData, data);
        if (xmlData.getElementsByTagName('remote').length > 0) {
            data.remote = true;
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
                    option.value = new I18nWithDynamic(val.childNodes[0].nodeValue);
                    option.key = val.childNodes[0].nodeValue;
                    data.options.push(option);
                }
            }
            result.addInfo(`Values of field ${data.id} changed to options`);
        }

        if (xmlData.getElementsByTagName('options').length > 0) {
            for (const val of Array.from(xmlData.getElementsByTagName('options')[0]?.getElementsByTagName('option'))) {
                const key = val.getAttribute('key');
                const value = new I18nString(val.innerHTML);
                value.name = val.getAttribute('name');
                data.options.push(Option.of(key, value));
            }
            data.optionsInit = this.importUtils.parseExpression(xmlData.getElementsByTagName('options')[0], 'init');
        }
        const valid = this.importUtils.tagValue(xmlData, 'valid');
        if (valid !== '') {
            const validation = new Validation();
            validation.expression = new Expression(valid, xmlData.getElementsByTagName('valid').item(0).getAttribute('dynamic') === 'true');
            data.addValidation(validation);
            result.addInfo(`Tags <valid> of field ${data.id} changed to validations`);
        }
        if (xmlData.getElementsByTagName('validations').length > 0) {
            for (const val of Array.from(xmlData.getElementsByTagName('validations')[0]?.children)) {
                const validation = new Validation();
                validation.expression = new Expression(this.importUtils.tagValue((val as HTMLDataElement), 'expression'), val.getAttribute('dynamic') === 'true');
                validation.message = this.importUtils.parseI18n((val as HTMLDataElement), 'message');
                data.addValidation(validation);
            }
        }
        for (const actionRef of Array.from(xmlData.getElementsByTagName('actionRef'))) {
            data.actionRef.push(this.importUtils.tagValue(actionRef, 'id'));
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
        for (const xmlEvent of Array.from(xmlData.getElementsByTagName('event'))) {
            const event = new DataEvent(this.importUtils.tagAttribute(xmlEvent, 'type') as DataEventType);
            this.importUtils.parseEvent(xmlEvent, event);
            data.mergeEvent(event);
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
                const xx = this.importUtils.parseNumberValue(xmlTrans, 'x');
                const yy = this.importUtils.parseNumberValue(xmlTrans, 'y');
                const trans = new Transition(xx, yy, id);
                this.parseTransition(modelResult, xmlTrans, trans);
            } catch (e) {
                modelResult.addError('Importing transition [' + id + ']: ' + e.toString(), e);
            }
        }
    }

    public parseTransition(result: PetriNetResult, xmlTrans: Element, trans: Transition): void {
        result.model.addTransition(trans);

        this.importTransitionMetadata(xmlTrans, trans, result);
        this.importTransitionLayout(xmlTrans, trans, result);
        this.importTransitionRoleRefs(xmlTrans, trans, result);
        this.importTransitionUserRefs(xmlTrans, trans, result);
        this.importTransitionDataGroups(xmlTrans, trans, result);
        this.importTransitionTriggers(xmlTrans, trans, result);
        this.importTransitionEvents(xmlTrans, trans, result);
        this.importAssignedUser(xmlTrans, trans, result);
        this.importTransactionRef(xmlTrans, trans, result);
    }

    private importTransitionRoleRefs(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            for (const xmlRoleRef of Array.from(xmlTrans.getElementsByTagName('roleRef'))) {
                trans.roleRefs.push(this.importUtils.parseRoleRef(xmlRoleRef));
            }
        } catch (e) {
            result.addError('Importing transition role refs failed', e);
        }
    }

    private importTransitionUserRefs(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            for (const xmlUserRef of Array.from(xmlTrans.getElementsByTagName('usersRef'))) {
                const xmlUserRefLogic = xmlUserRef.getElementsByTagName('logic')[0];
                const userRef = new UserRef(this.importUtils.tagValue(xmlUserRef, 'id'));
                this.importUtils.resolveLogic(xmlUserRefLogic, userRef);
                trans.userRefs.push(userRef);
            }
        } catch (e) {
            result.addError('Importing transition user refs failed', e);
        }
    }

    private importTransitionTriggers(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            for (const xmlTrigger of Array.from(xmlTrans.getElementsByTagName('trigger'))) {
                trans.triggers.push(this.importUtils.parseTrigger(xmlTrigger));
            }
        } catch (e) {
            result.addError('Importing transition triggers failed', e);
        }
    }

    private importTransitionDataGroups(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            for (const xmlDataGroup of Array.from(xmlTrans.getElementsByTagName('dataGroup'))) {
                const id = this.importUtils.tagValue(xmlDataGroup, 'id');
                try {
                    trans.dataGroups.push(this.importUtils.parseDataGroup(xmlDataGroup));
                } catch (e) {
                    result.addError(`Importing data group '${id}' failed`, e);
                }
            }
            const xmlDataRefs = Array.from(xmlTrans.getElementsByTagName('dataRef'));
            if (trans.dataGroups.length === 0 && xmlDataRefs.length > 0) {
                const dataGroup = new DataGroup('NewDataGroup');
                dataGroup.stretch = true;
                for (let i = 0; i < xmlDataRefs.length; i++) {
                    const xmlDataRef = xmlDataRefs[i];
                    if (xmlDataRef.parentElement.tagName !== 'transition') {
                        continue;
                    }
                    dataGroup.addDataRef(this.importUtils.parseDataRef(xmlDataRef, i));
                }
                trans.dataGroups.push(dataGroup);
                result.addInfo(`Data references of transition '${trans.id}' wrapped with new data group`);
            }
        } catch (e) {
            result.addError('Importing transition data groups failed', e);
        }
    }

    private importTransitionLayout(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            const xmlLayout = xmlTrans.getElementsByTagName('layout');
            if (xmlLayout.length !== 0 && xmlLayout.item(0).parentNode.isSameNode(xmlTrans)) {
                trans.layout.cols = this.importUtils.parseNumberValue(xmlLayout.item(0), 'cols');
                trans.layout.rows = this.importUtils.parseNumberValue(xmlLayout.item(0), 'rows');
                trans.layout.offset = this.importUtils.parseNumberValue(xmlLayout.item(0), 'offset');
                trans.layout.alignment = this.importUtils.tagValue(xmlLayout.item(0), 'fieldAlignment') as Alignment;
                trans.layout.type = this.importUtils.tagAttribute(xmlLayout.item(0), 'type') as LayoutType;
            }
        } catch (e) {
            result.addError('Importing transition layout failed', e);
        }
    }

    private importTransitionMetadata(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            if (this.importUtils.checkLengthAndNodes(xmlTrans, 'label')) {
                trans.label = this.importUtils.parseI18n(xmlTrans, 'label');
            }
            trans.icon = this.importUtils.tagValue(xmlTrans, 'icon');
            trans.priority = parseInt(this.importUtils.tagValue(xmlTrans, 'priority'), 10);
            const assignPolicy = this.importUtils.tagValue(xmlTrans, 'assignPolicy');
            trans.assignPolicy = assignPolicy === '' ? AssignPolicy.MANUAL : (assignPolicy as AssignPolicy);
            trans.dataFocusPolicy = this.importUtils.tagValue(xmlTrans, 'dataFocusPolicy') === '' ? DataFocusPolicy.MANUAL :
                (this.importUtils.tagValue(xmlTrans, 'dataFocusPolicy') as DataFocusPolicy);
            const finishPolicy = this.importUtils.tagValue(xmlTrans, 'finishPolicy');
            trans.finishPolicy = finishPolicy === '' ? FinishPolicy.MANUAL : (finishPolicy as FinishPolicy);
        } catch (e) {
            result.addError('Importing transition metadata failed', e);
        }
    }

    private importTransitionEvents(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            const events = Array.from(xmlTrans.getElementsByTagName('event'));
            events.forEach((xmlEvent, index) => {
                this.importTransitionEvent(xmlEvent, index, trans, result);
            });
        } catch (e) {
            result.addError('Importing transition events failed', e);
        }
    }

    private importTransitionEvent(xmlEvent: Element, index: number, trans: Transition, result: PetriNetResult) {
        try {
            if (xmlEvent.parentElement.tagName !== 'transition') {
                return;
            }
            const event = new TransitionEvent(this.importUtils.tagAttribute(xmlEvent, 'type') as TransitionEventType);
            event.message = this.importUtils.parseI18n(xmlEvent, 'message');
            event.title = this.importUtils.parseI18n(xmlEvent, 'title');
            this.importUtils.parseEvent(xmlEvent, event);
            trans.mergeEvent(event);
        } catch (e) {
            result.addError(`Importing transition event with index [${index} ${xmlEvent.id}] failed`, e);
        }
    }

    private importTransactionRef(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            if (xmlTrans.getElementsByTagName('transactionRef').length > 0 &&
                xmlTrans.getElementsByTagName('transactionRef')[0].childNodes.length !== 0) {
                trans.transactionRef = this.importUtils.tagValue(xmlTrans, 'transactionRef');
            }
        } catch (e) {
            result.addError('Importing transaction refs failed', e);
        }
    }

    private importAssignedUser(xmlTrans: Element, trans: Transition, result: PetriNetResult) {
        try {
            if (xmlTrans.getElementsByTagName('assignedUser').length > 0) {
                const xmlAssigned = xmlTrans.getElementsByTagName('assignedUser').item(0);
                const assignedUser = new AssignedUser();
                assignedUser.cancel = this.importUtils.tagValue(xmlAssigned, 'cancel') !== '' ? this.importUtils.tagValue(xmlAssigned, 'cancel') === 'true' : undefined;
                assignedUser.reassign = this.importUtils.tagValue(xmlAssigned, 'reassign') !== '' ? this.importUtils.tagValue(xmlAssigned, 'reassign') === 'true' : undefined;
                trans.assignedUser = assignedUser;
            }
        } catch (e) {
            result.addError('Importing assigned user failed', e);
        }
    }

    public importTransactions(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlTransaction of Array.from(xmlDoc.getElementsByTagName('transaction'))) {
            try {
                const title = this.importUtils.parseI18n(xmlTransaction, 'title');
                modelResult.model.addTransaction(new Transaction(this.importUtils.tagValue(xmlTransaction, 'id'), title));
            } catch (e) {
                modelResult.addError('Error happened during the importing transaction [' + this.importUtils.tagValue(xmlTransaction, 'id') + ']: ' + e.toString(), e);
            }
        }
    }

    public importProcessRefs(modelResult: PetriNetResult, xmlDoc: Document): void { // TODO: two methods
        for (const xmlRoleRef of Array.from(xmlDoc.getElementsByTagName('roleRef'))) {
            try {
                const xmlRoleRefLogic = xmlRoleRef.getElementsByTagName('caseLogic')[0];
                if (xmlRoleRefLogic !== undefined) {
                    const roleRef = new ProcessRoleRef(this.importUtils.tagValue(xmlRoleRef, 'id'));
                    this.importUtils.resolveCaseLogic(xmlRoleRefLogic, roleRef);
                    modelResult.model.addRoleRef(roleRef);
                }
            } catch (e) {
                modelResult.addError('Error happened during the importing process role refs [' + this.importUtils.tagValue(xmlRoleRef, 'id') + ']: ' + e.toString(), e);
            }
        }
        for (const xmlUserRef of Array.from(xmlDoc.getElementsByTagName('usersRef'))) {
            try {
                const xmlUserRefLogic = xmlUserRef.getElementsByTagName('caseLogic')[0];
                if (xmlUserRefLogic !== undefined) {
                    const userRef = new ProcessUserRef(this.importUtils.tagValue(xmlUserRef, 'id'));
                    this.importUtils.resolveCaseLogic(xmlUserRefLogic, userRef);
                    modelResult.model.addUserRef(userRef);
                }
            } catch (e) {
                modelResult.addError('Error happened during the importing process user refs  [' + this.importUtils.tagValue(xmlUserRef, 'id') + ']: ' + e.toString(), e);
            }
        }
    }

    public importPlaces(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlPlace of Array.from(xmlDoc.getElementsByTagName('place'))) {
            try {
                const xx = this.importUtils.parseNumberValue(xmlPlace, 'x');
                const yy = this.importUtils.parseNumberValue(xmlPlace, 'y');
                const isStatic = this.importUtils.parsePlaceStatic(xmlPlace);
                const place = new Place(xx, yy, isStatic, xmlPlace.getElementsByTagName('id')[0].childNodes[0].nodeValue);
                this.parsePlace(modelResult.model, xmlPlace, place);
            } catch (e) {
                modelResult.addError('Error happened during the importing places [' + this.importUtils.tagValue(xmlPlace, 'id') + ']: ' + e.toString(), e);
            }
        }
    }

    public parsePlace(model: PetriNet, xmlPlace: Element, place: Place): void {
        model.addPlace(place);

        place.marking = this.importUtils.parseNumberValue(xmlPlace, 'tokens');
        if (xmlPlace.getElementsByTagName('label').length > 0 &&
            xmlPlace.getElementsByTagName('label')[0].childNodes.length !== 0) {
            place.label = new I18nString(xmlPlace.getElementsByTagName('label')[0].childNodes[0].nodeValue);
        }
    }

    public importArcs(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlArc of Array.from(xmlDoc.getElementsByTagName('arc'))) {
            try {
                const arc = this.parseArc(modelResult, xmlArc);
                modelResult.model.addArc(arc);
            } catch (e) {
                modelResult.addError('Error happened during the importing arcs [' + this.importUtils.tagValue(xmlArc, 'id') + ']: ' + e.toString(), e);
            }
        }
    }

    public parseArc(result: PetriNetResult, xmlArc: Element): Arc {
        const source = xmlArc.getElementsByTagName('sourceId')[0].childNodes[0].nodeValue;
        const target = xmlArc.getElementsByTagName('destinationId')[0].childNodes[0].nodeValue;
        const parsedArcType = this.importUtils.parseArcType(xmlArc);
        const arc = new Arc(source, target, parsedArcType, xmlArc.getElementsByTagName('id')[0].childNodes[0].nodeValue);
        arc.multiplicity = this.importUtils.parseNumberValue(xmlArc, 'multiplicity');
        if (arc.type === ArcType.VARIABLE) {
            arc.type = ArcType.REGULAR;
            arc.reference = xmlArc.getElementsByTagName('multiplicity')[0].childNodes[0].nodeValue;
            this.importUtils.checkVariability(result.model, arc, arc.reference);
            result.addInfo(`Variable arc '${arc.id}' converted to regular with data field reference`);
        } else if (this.importUtils.checkLengthAndNodes(xmlArc, 'reference')) {
            const refhrany = xmlArc.getElementsByTagName('reference')[0].childNodes[0].nodeValue;
            this.importUtils.checkVariability(result.model, arc, refhrany);
        }

        if (xmlArc.getElementsByTagName('breakPoint').length > 0) {
            Array.from(xmlArc.getElementsByTagName('breakPoint')).forEach((breakpoint, index) => {
                const xx = this.importUtils.parseNumberValue(breakpoint, 'x');
                const yy = this.importUtils.parseNumberValue(breakpoint, 'y');
                arc.breakpoints.push({x: xx, y: yy} as Breakpoint);
            });
        }
        return arc;
    }

    public importI18n(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlI18n of Array.from(xmlDoc.getElementsByTagName('i18n'))) {
            try {
                const locale = this.importUtils.tagAttribute(xmlI18n, 'locale');
                const i18nNode = new I18nTranslations(locale);
                this.parseI18n(modelResult, xmlI18n, i18nNode);
            } catch (e) {
                modelResult.addError('Error happened during the importing i18n [' + this.importUtils.tagAttribute(xmlI18n, 'locale') + ']: ' + e.toString(), e);
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
                result.addError(`Importing i18n string '${name}' failed`, e);
            }
        }
        result.model.addI18n(i18nNode);
    }

    public importMapping(modelResult: PetriNetResult, xmlDoc: Document): void {
        for (const xmlMap of Array.from(xmlDoc.getElementsByTagName('mapping'))) {
            try {
                const mapping = new Mapping(this.importUtils.tagValue(xmlMap, 'id'),
                    this.importUtils.tagValue(xmlMap, 'transitionRef'));
                this.parseMapping(modelResult.model, xmlMap, mapping);
            } catch (e) {
                modelResult.addError('Error happened during the importing mapping [' + this.importUtils.tagValue(xmlMap, 'id') + ']: ' + e.toString(), e);
            }
        }
    }

    public parseMapping(model: PetriNet, xmlMap: Element, mapping: Mapping): void {
        for (const xmlRoleRef of Array.from(xmlMap.getElementsByTagName('roleRef'))) {
            mapping.roleRef.push(this.importUtils.parseRoleRef(xmlRoleRef));
        }
        const xmlDataRefs = Array.from(xmlMap.getElementsByTagName('dataRef'));
        for (let i = 0; i < xmlDataRefs.length; i++) {
            const xmlDataRef = xmlDataRefs[i];
            if (xmlDataRef.parentElement.tagName !== 'mapping') {
                continue;
            }
            mapping.dataRef.push(this.importUtils.parseDataRef(xmlDataRef, i));
        }
        for (const xmlDataGroup of Array.from(xmlMap.getElementsByTagName('dataGroup'))) {
            mapping.dataGroup.push(this.importUtils.parseDataGroup(xmlDataGroup));
        }
        for (const xmlTrigger of Array.from(xmlMap.getElementsByTagName('trigger'))) {
            mapping.trigger.push(this.importUtils.parseTrigger(xmlTrigger));
        }
        model.addMapping(mapping);
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
                d.getValidations().forEach(v => {
                    this.checkI18n(v.message, i18ns, modelResult);
                });
            });
            model.getTransitions().forEach(t => {
                this.checkI18n(t.label, i18ns, modelResult);
                t.dataGroups.forEach(g => {
                    this.checkI18n(g.title, i18ns, modelResult);
                });
                t.getEvents().forEach(e => {
                    this.checkI18n(e.title, i18ns, modelResult);
                    this.checkI18n(e.message, i18ns, modelResult);
                });
            });
            model.getPlaces().forEach(p => {
                this.checkI18n(p.label, i18ns, modelResult);
            });
        });
    }

    private checkI18n(s: I18nString, i18ns: I18nTranslations, modelResult: PetriNetResult) {
        if (s && s.name) {
            const i18n = i18ns.getI18n(s.name);
            if (!i18n) {
                modelResult.addWarning(`I18n string with name ${s.name} has no translation in locale ${i18ns.locale}`);
            }
        }
    }
}
