// noinspection DuplicatedCode

const {
    ImportService, ExportService,
    ResourceScope,
    ProcessEventType,
    CaseEventType,
    RoleEventType,
    Role,
    DataEventType,
    DataType,
    AssignPolicy,
    FinishPolicy,
    TransitionEventType,
    DataRefBehavior,
    FlexItemAlignSelf,
    TriggerType,
    ArcType
} = require("../../dist/petriflow.js");
const fs = require('fs');
const {beforeEach, describe, test, expect} = require("@jest/globals");
const format = require('xml-formatter');


let debug = false;

const ACTION_DEFINITION_CDATA_CONTENT = 'some cdata';
const MODEL_ID = 'petriflow_test';
const MODEL_TITLE_VALUE = 'Petriflow Test Model';
const MODEL_TITLE_ID = 'title';
const MODEL_ICON = 'home';
const MODEL_DEFAULT_CASE_NAME_VALUE = '${new Date() as String}';
const MODEL_DEFAULT_ROLE = true;
const MODEL_ANONYMOUS_ROLE = true;
const MODEL_TAGS_LENGTH = 3;
const MODEL_TAGS_FIRST = 'First';
const MODEL_TAGS_SECOND = 'Second';
const PROCESS_EVENTS_LENGTH = 1;
const PROCESS_EVENTS_UPLOAD_ID = 'process_upload';
const PROCESS_EVENTS_UPLOAD_PRE_LENGTH = 1;
const PROCESS_EVENTS_UPLOAD_POST_LENGTH = 1;
const ACTION_DEFINITION_JAVA_COMMENT = '// some java comment';
const ACTION_DEFINITION_XML_COMMENT = '<!-- some xml comment                    -->';
const CASE_EVENTS_CREATE_PRE_LENGTH = 1;
const CASE_EVENTS_CREATE_ID = 'case_create';
const CASE_EVENTS_CREATE_POST_LENGTH = 1;
const CASE_EVENTS_DELETE_ID = 'case_delete';
const CASE_EVENTS_DELETE_PRE_LENGTH = 1;
const CASE_EVENTS_DELETE_POST_LENGTH = 1;
const ROLE_TITLE_VALUE = 'title';
const MODEL_ROLES_LENGTH = 4;
const MODEL_TRANSITIONS_LENGTH = 13;
const MODEL_PLACES_LENGTH = 12;
const MODEL_ARCS_LENGTH = 17;
const MODEL_DATA_LENGTH = 24;
const ROLE_1_ID = 'newRole_1';
const ROLE_2_ID = 'newRole_2';
const ROLE_3_ID = 'newRole_3';
const ROLE_4_ID = 'newRole_4';
const ACTION_DEFINITION_ESCAPED = 'if (a < b && c) d >> e';
const ROLE_1_TITLE_NAME = 'role_1_title';
const TIME_TRIGGER_EXACT = '2021-07-14T08:00:00.000Z';
const TIME_TRIGGER_DELAY = 'PT5D';
const LEGACY_FILE_PATH = 'src/test/resources/petriflow_test_legacy.xml';

describe('Petriflow legacy model import tests', () => {
    let importService;
    let exportService;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
    });

    test('request model test', () => {
        const resources = 'src/test/resources/migration';
        fs.readdirSync(resources).filter(filePath => !filePath.endsWith('_new.xml')).forEach(filePath => {
            console.log(filePath);
            const fileName = filePath.replace('.xml', '');
            const file = fs.readFileSync(`${resources}/${fileName}.xml`).toString();
            const result = importService.parseFromXml(file);
            const exported = exportService.exportXml(result.model);
            const pretty = prettyFormat(exported);
            fs.writeFileSync(`${resources}/${fileName}_new.xml`, pretty);
        });
    });

    test('legacy import test', () => {
        let file = fs.readFileSync(LEGACY_FILE_PATH).toString();
        debug = true;
        const model1 = importAndExport(file, 18, 38, 25);
        expect(model1).toBeDefined();
        const model2 = importAndExport(model1, 0, 19, 0);
        expect(model2).toBeDefined();
        expect(model1).toEqual(model2);
    });

    function assertPlace(place, id, x, y, label, marking, isStatic, i18nName, scope = ResourceScope.USECASE, properties = undefined) {
        expect(place.id).toEqual(id);
        expect(place.x).toEqual(x);
        expect(place.y).toEqual(y);
        if (label && label !== '') {
            expect(place.title).not.toBeUndefined();
            expect(place.title.value).toEqual(label);
            if (i18nName && i18nName !== '') {
                expect(place.title.id).toEqual(i18nName);
            }
        }
        expect(place.marking).toEqual(marking);
        expect(place.scope).toEqual(scope);
        assertProperties(place.properties, properties)
    }

    function assertProperties(properties, testProperties = undefined) {
        if (testProperties === undefined) {
            expect(properties.size).toEqual(0);
            return;
        }
        expect(properties.size).toEqual(testProperties.size);
        expect(properties).toStrictEqual(testProperties);
    }

    function assertArc(arc, id, type, source, destination, multiplicity = {
        dynamic: false,
        expression: '1'
    }, breakpoints) {
        expect(arc.id).toEqual(id);
        expect(arc.type).toEqual(type);
        expect(arc.destination.id).toEqual(destination);
        expect(arc.source.id).toEqual(source);
        expect(arc.multiplicity.dynamic).toEqual(multiplicity.dynamic);
        expect(arc.multiplicity.expression).toEqual(multiplicity.expression);
        if (breakpoints && breakpoints.length > 0) {
            expect(arc.breakpoints.length).toEqual(breakpoints.length);
            for (let i = 0; i < breakpoints.length; i++) {
                expect(arc.breakpoints[i].x).toEqual(breakpoints[i].x);
                expect(arc.breakpoints[i].y).toEqual(breakpoints[i].y);
            }
        }
    }

    function assertI18n(locale, i18ns, model) {
        const i18nLocale = model.getI18n(locale);
        expect(i18nLocale.getI18ns().length).toEqual(i18ns.length);
        i18ns.forEach(i => {
            log(i);
            expect(i18nLocale.getI18n(i)).not.toBeUndefined();
            expect(i18nLocale.getI18n(i).value).toEqual(`${locale.toUpperCase()}_${i}`);
        });
    }

    function assertRoleRefLogic(roleRef, perform, reassign, cancel, assign, view) {
        expect(roleRef.logic.perform).toEqual(perform);
        expect(roleRef.logic.reassign).toEqual(reassign);
        expect(roleRef.logic.cancel).toEqual(cancel);
        expect(roleRef.logic.assign).toEqual(assign);
        expect(roleRef.logic.view).toEqual(view);
    }

    function assertCorrectImport(model) {
        expect(model.id).toEqual(MODEL_ID);
        expect(model.title).not.toBeUndefined();
        expect(model.title.value).toEqual(MODEL_TITLE_VALUE);
        expect(model.title.id).toEqual(MODEL_TITLE_ID);
        expect(model.icon).toEqual(MODEL_ICON);
        expect(model.defaultRole).toEqual(MODEL_DEFAULT_ROLE);
        expect(model.anonymousRole).toEqual(MODEL_ANONYMOUS_ROLE);
        expect(model.caseName).not.toBeUndefined();
        expect(model.caseName.value).toEqual(MODEL_DEFAULT_CASE_NAME_VALUE);
        expect(model.caseName.dynamic).toEqual(true);
        log(model.properties);
        expect(model.properties.size).toEqual(MODEL_TAGS_LENGTH);
        expect(model.properties.get(MODEL_TAGS_FIRST)).toEqual(MODEL_TAGS_FIRST);
        expect(model.properties.get(MODEL_TAGS_SECOND)).toEqual(MODEL_TAGS_SECOND);
        log('Model metadata OK');

        expect(model.getProcessEvents().length).toEqual(PROCESS_EVENTS_LENGTH);
        const processUploadEvent = model.getProcessEvent(ProcessEventType.UPLOAD);
        expect(processUploadEvent.id).toEqual(PROCESS_EVENTS_UPLOAD_ID);
        expect(processUploadEvent.preActions.length).toEqual(PROCESS_EVENTS_UPLOAD_PRE_LENGTH);
        expect(processUploadEvent.preActions[0].definition).toContain('test("process_upload_pre")');
        expect(processUploadEvent.postActions.length).toEqual(PROCESS_EVENTS_UPLOAD_POST_LENGTH);
        expect(processUploadEvent.postActions[0].definition).toContain(ACTION_DEFINITION_XML_COMMENT);
        expect(processUploadEvent.postActions[0].definition).toContain(ACTION_DEFINITION_JAVA_COMMENT);
        expect(processUploadEvent.postActions[0].definition).toContain('test("process_upload_post")');
        expect(processUploadEvent.postActions[0].definition).toContain(ACTION_DEFINITION_CDATA_CONTENT);
        expect(processUploadEvent.postActions[0].definition).toContain(ACTION_DEFINITION_ESCAPED);
        assertProperties(processUploadEvent.properties)
        log('Model process events correct');

        expect(model.getCaseEvents().length).toEqual(2);
        const caseCreateEvent = model.getCaseEvent(CaseEventType.CREATE);
        expect(caseCreateEvent.id).toEqual(CASE_EVENTS_CREATE_ID);
        expect(caseCreateEvent.preActions.length).toEqual(CASE_EVENTS_CREATE_PRE_LENGTH);
        expect(caseCreateEvent.preActions[0].definition).toContain('test("case_create_pre")');
        expect(caseCreateEvent.postActions.length).toEqual(CASE_EVENTS_CREATE_POST_LENGTH);
        expect(caseCreateEvent.postActions[0].definition).toContain('test("case_create_post")');
        const caseDeleteEvent = model.getCaseEvent(CaseEventType.DELETE);
        expect(caseDeleteEvent.id).toEqual(CASE_EVENTS_DELETE_ID);
        expect(caseDeleteEvent.preActions.length).toEqual(CASE_EVENTS_DELETE_PRE_LENGTH);
        expect(caseDeleteEvent.preActions[0].definition).toContain('test("case_delete_pre")');
        expect(caseDeleteEvent.postActions.length).toEqual(CASE_EVENTS_DELETE_POST_LENGTH);
        expect(caseDeleteEvent.postActions[0].definition).toContain('test("case_delete_post")');
        log('Model case events correct');

        expect(model.getRoles().length).toEqual(MODEL_ROLES_LENGTH);
        const role1 = model.getRole(ROLE_1_ID);
        const role2 = model.getRole(ROLE_2_ID);
        const role3 = model.getRole(ROLE_3_ID);
        const role4 = model.getRole(ROLE_4_ID);
        expect(role1.title).not.toBeUndefined();
        expect(role1.title.value).toEqual(ROLE_TITLE_VALUE);
        expect(role1.title.id).toEqual(ROLE_1_TITLE_NAME);
        expect(role1.getEvents().length).toEqual(2);
        expect(role1.scope).toEqual(ResourceScope.USECASE);
        const roleAssignEvent = role1.getEvent(RoleEventType.ASSIGN);
        expect(roleAssignEvent.id).toEqual('assign_role');
        expect(roleAssignEvent.preActions.length).toEqual(1);
        expect(roleAssignEvent.preActions[0].definition).toContain('test("assign_role_pre")');
        expect(roleAssignEvent.postActions.length).toEqual(1);
        expect(roleAssignEvent.postActions[0].definition).toContain('test("assign_role_post")');
        const roleCancelEvent = role1.getEvent(RoleEventType.CANCEL);
        expect(roleCancelEvent.id).toEqual('cancel_role');
        expect(roleCancelEvent.preActions.length).toEqual(1);
        expect(roleCancelEvent.preActions[0].definition).toContain('test("cancel_role_pre")');
        expect(roleCancelEvent.postActions.length).toEqual(1);
        expect(roleCancelEvent.postActions[0].definition).toContain('test("cancel_role_post")');
        expect(role2.title).not.toBeUndefined();
        expect(role2.scope).toEqual(ResourceScope.USECASE);
        expect(role2.title.value).toEqual(ROLE_TITLE_VALUE);
        expect(role2.title.id).toEqual('role_2_title');
        expect(role3.title).not.toBeUndefined();
        expect(role3.title.value).toEqual(ROLE_TITLE_VALUE);
        expect(role3.title.id).toEqual('role_3_title');
        expect(role4.title).not.toBeUndefined();
        expect(role4.title.value).toEqual(ROLE_TITLE_VALUE);
        expect(role4.title.id).toEqual('role_4_title');
        log('Model roles correct');

        expect(model.functions).toBeDefined();
        expect(model.functions.length).toEqual(2);
        const processFunction = model.functions.find(f => f.name === 'calc');
        expect(processFunction).toBeDefined();
        expect(processFunction.scope).toEqual(ResourceScope.PROCESS);
        expect(processFunction.definition).toContain('{ monthly, loan, period ->');
        expect(processFunction.definition).toContain('change monthly value { (loan + loan * 0.02 * period) / (period * 12) }');
        expect(processFunction.definition).toContain('}');
        const namespaceFunction = model.functions.find(f => f.name === 'sum');
        expect(namespaceFunction).toBeDefined();
        expect(namespaceFunction.scope).toEqual(ResourceScope.NAMESPACE);
        expect(namespaceFunction.definition).toContain('{ Double x, Double y ->');
        expect(namespaceFunction.definition).toContain('return x + y');
        expect(namespaceFunction.definition).toContain('}');
        log('Model functions correct');

        expect(model.getRoleRefs().length).toEqual(5);
        const roleRef1 = model.getRoleRef(ROLE_1_ID);
        expect(roleRef1.logic.delete).toEqual(true);
        expect(roleRef1.logic.create).toEqual(false);
        expect(roleRef1.logic.view).toBeUndefined();
        const roleRef2 = model.getRoleRef(ROLE_2_ID);
        expect(roleRef2.logic.delete).toEqual(false);
        expect(roleRef2.logic.create).toBeUndefined();
        expect(roleRef2.logic.view).toEqual(false);
        const roleRef3 = model.getRoleRef(ROLE_3_ID);
        expect(roleRef3.logic.delete).toBeUndefined();
        expect(roleRef3.logic.create).toEqual(false);
        expect(roleRef3.logic.view).toEqual(true);
        const roleRefAnonymous = model.getRoleRef(Role.ANONYMOUS);
        expect(roleRefAnonymous.logic.create).toEqual(true);
        expect(roleRefAnonymous.logic.view).toEqual(false);
        expect(roleRefAnonymous.logic.delete).toEqual(undefined);
        const roleRefDefault = model.getRoleRef(Role.DEFAULT);
        expect(roleRefDefault.logic.create).toEqual(undefined);
        expect(roleRefDefault.logic.view).toEqual(true);
        expect(roleRefDefault.logic.delete).toEqual(false);
        log('Model role refs correct');

        expect(model.getDataSet().length).toEqual(MODEL_DATA_LENGTH);
        expect(model.getData('_')).toBeUndefined();
        expect(model.getData('123321')).toBeUndefined();
        const cdataField = model.getData('cdata_escape');
        expect(cdataField.title.value).toEqual('CDATA &<>');
        expect(cdataField.init.value).toContain('<p>CDATA &amp;&lt;&gt;</p>');
        expect(cdataField.getEvent(DataEventType.SET).postActions.length).toEqual(2);
        const numberField = model.getData('newVariable_1');
        expect(numberField.type).toEqual(DataType.NUMBER);
        expect(numberField.title.value).toEqual('title');
        expect(numberField.init.value).toEqual('5');
        expect(numberField.init.dynamic).toEqual(false);
        expect(numberField.validations.length).toEqual(1);
        const numberFieldValidation = numberField.validations[0];
        expect(numberFieldValidation.expression.expression).toEqual('inrange 1,10');
        expect(numberFieldValidation.expression.dynamic).toEqual(false);
        const numberFieldGetEvent = numberField.getEvent(DataEventType.GET);
        expect(numberFieldGetEvent.preActions.length).toEqual(1);
        expect(numberFieldGetEvent.postActions.length).toEqual(1);
        const numberFieldSetEvent = numberField.getEvent(DataEventType.SET);
        expect(numberFieldSetEvent.preActions.length).toEqual(1);
        expect(numberFieldSetEvent.postActions.length).toEqual(1);
        expect(numberField.component).not.toBeUndefined();
        expect(numberField.component.id).toEqual('currency');
        expect(numberField.component.properties.get('code')).not.toBeUndefined();
        expect(numberField.component.properties.get('code')).toEqual('SK');
        expect(numberField.component.properties.get('fractionSize')).not.toBeUndefined();
        expect(numberField.component.properties.get('fractionSize')).toEqual('2');
        expect(numberField.component.properties.get('locale')).not.toBeUndefined();
        expect(numberField.component.properties.get('locale')).toEqual('SK');
        const textField = model.getData('newVariable_2');
        expect(textField.type).toEqual(DataType.TEXT);
        expect(textField.title.id).toEqual('newVariable_2_title');
        expect(textField.title.value).toEqual('newVariable_2_title_value');
        expect(textField.placeholder.id).toEqual('newVariable_2_placeholder');
        expect(textField.placeholder.value).toEqual('newVariable_2_placeholder_value');
        expect(textField.desc.id).toEqual('newVariable_2_desc');
        expect(textField.desc.value).toEqual('newVariable_2_desc_value');
        expect(textField.encryption).toEqual('SHA2');
        expect(textField.validations.length).toEqual(2);
        expect(textField.validations[0].expression.expression).toEqual('inrange 1,2000');
        expect(textField.validations[0].message.value).toEqual('invalid text');
        expect(textField.validations[0].message.id).toBeUndefined();
        expect(textField.validations[1].expression.expression).toEqual('email');
        expect(textField.validations[1].message.value).toEqual('invalid email');
        expect(textField.validations[1].message.id).toEqual('newVariable_2_valid_email');
        const textFieldComponent = textField.component;
        expect(textFieldComponent).not.toBeUndefined();
        expect(textFieldComponent.id).toEqual('area');
        const enumerationField = model.getData('newVariable_3');
        expect(enumerationField).not.toBeUndefined();
        expect(enumerationField.options.length).toEqual(3);
        expect(enumerationField.options.find(o => o.key === 'option1')).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option1').value).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option1').value.value).toEqual('option1');
        expect(enumerationField.options.find(o => o.key === 'option1').value.id).toEqual('newVariable_3_value1');
        expect(enumerationField.options.find(o => o.key === 'option2')).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option2').value).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option2').value.value).toEqual('option2');
        expect(enumerationField.options.find(o => o.key === 'option2').value.id).toEqual('newVariable_3_value2');
        expect(enumerationField.options.find(o => o.key === 'option3')).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option3').value).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option3').value.value).toEqual('option3');
        expect(enumerationField.options.find(o => o.key === 'option3').value.id).toEqual('newVariable_3_value3');
        expect(enumerationField.component).not.toBeUndefined();
        expect(enumerationField.component.id).toEqual('autocomplete');
        const enumerationAutocompleteField = model.getData('newVariable_3_view_autocomplete');
        expect(enumerationAutocompleteField).not.toBeUndefined();
        expect(enumerationAutocompleteField.component).not.toBeUndefined();
        expect(enumerationAutocompleteField.component.id).toEqual('autocomplete');
        const enumerationListField = model.getData('newVariable_3_view_list');
        expect(enumerationListField).not.toBeUndefined();
        expect(enumerationListField.component).not.toBeUndefined();
        expect(enumerationListField.component.id).toEqual('list');
        // TODO: check view
        const enumerationMapField = model.getData('newVariable_4');
        expect(enumerationMapField).not.toBeUndefined();
        expect(enumerationMapField.options.length).toEqual(3);
        expect(enumerationMapField.options.find(o => o.key === 'key1')).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key1').value).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key1').value.value).toEqual('value1');
        expect(enumerationMapField.options.find(o => o.key === 'key1').value.id).toEqual('newVariable_4_option_1');
        expect(enumerationMapField.options.find(o => o.key === 'key2')).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key2').value).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key2').value.value).toEqual('value2');
        expect(enumerationMapField.options.find(o => o.key === 'key2').value.id).toEqual('newVariable_4_option_2');
        expect(enumerationMapField.options.find(o => o.key === 'key3')).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key3').value).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key3').value.value).toEqual('value3');
        expect(enumerationMapField.options.find(o => o.key === 'key3').value.id).toEqual('newVariable_4_option_3');
        expect(enumerationMapField.component).not.toBeUndefined();
        expect(enumerationMapField.component.id).toEqual('icon');
        expect(enumerationMapField.component.properties.size).toEqual(5);
        expect(enumerationMapField.component.properties.get('arrow')).not.toBeUndefined();
        expect(enumerationMapField.component.properties.get('arrow')).toEqual('true');
        expect(enumerationMapField.component.properties.get('divider')).not.toBeUndefined();
        expect(enumerationMapField.component.properties.get('divider')).toEqual('true');
        // TODO: PF-75
        // expect(enumerationMapField.component.properties.get('key1')).not.toBeUndefined();
        // expect(enumerationMapField.component.properties.get('key1')).toEqual('home');
        // expect(enumerationMapField.component.properties.get('key2')).not.toBeUndefined();
        // expect(enumerationMapField.component.properties.get('key2')).toEqual('nature');
        // expect(enumerationMapField.component.properties.get('key3')).not.toBeUndefined();
        // expect(enumerationMapField.component.properties.get('key3')).toEqual('search');
        const multichoiceField = model.getData('newVariable_5');
        expect(multichoiceField).not.toBeUndefined();
        expect(multichoiceField.options.length).toEqual(2);
        expect(multichoiceField.options.find(o => o.key === 'option4')).not.toBeUndefined();
        expect(multichoiceField.options.find(o => o.key === 'option4').value).not.toBeUndefined();
        expect(multichoiceField.options.find(o => o.key === 'option4').value.value).toEqual('option4');
        expect(multichoiceField.options.find(o => o.key === 'option5')).not.toBeUndefined();
        expect(multichoiceField.options.find(o => o.key === 'option5').value).not.toBeUndefined();
        expect(multichoiceField.options.find(o => o.key === 'option5').value.value).toEqual('option5');
        const multichoiceMapField = model.getData('newVariable_6');
        expect(multichoiceMapField).not.toBeUndefined();
        expect(multichoiceMapField.options.length).toEqual(3);
        expect(multichoiceMapField.options.find(o => o.key === 'key4')).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key4').value).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key4').value.value).toEqual('value4');
        expect(multichoiceMapField.options.find(o => o.key === 'key5')).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key5').value).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key5').value.value).toEqual('value5');
        expect(multichoiceMapField.options.find(o => o.key === 'key6')).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key6').value).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key6').value.value).toEqual('value6');
        // TODO: PF-75
        // expect(multichoiceMapField.init).not.toBeUndefined();
        // expect(multichoiceMapField.init.id).toEqual('multichoice_init');
        // expect(multichoiceMapField.init.dynamic).toEqual(true);
        // expect(multichoiceMapField.init.value).toEqual('setMultichoiceInit()');
        const fileField = model.getData('newVariable_7');
        expect(fileField).not.toBeUndefined();
        const fileListField = model.getData('newVariable_8');
        expect(fileListField).not.toBeUndefined();
        const booleanField = model.getData('newVariable_9');
        expect(booleanField).not.toBeUndefined();
        const dateField = model.getData('newVariable_10');
        expect(dateField).not.toBeUndefined();
        expect(dateField.init).not.toBeUndefined();
        expect(dateField.init.dynamic).toEqual(true);
        expect(dateField.init.value).toEqual('new Date()');
        const dateTimeField = model.getData('newVariable_11');
        expect(dateTimeField).not.toBeUndefined();
        const userField = model.getData('newVariable_12');
        expect(userField).not.toBeUndefined();
        const taskRefField = model.getData('newVariable_13');
        expect(taskRefField).not.toBeUndefined();
        const caseRefField = model.getData('newVariable_14');
        expect(caseRefField).not.toBeUndefined();
        expect(caseRefField.allowedNets.length).toEqual(3);
        expect(caseRefField.allowedNets).toContain('net_1');
        expect(caseRefField.allowedNets).toContain('net_2');
        expect(caseRefField.allowedNets).toContain('net_3');
        const userListField = model.getData('newVariable_15');
        expect(userListField).not.toBeUndefined();
        const i18nField1 = model.getData('newVariable_19');
        expect(i18nField1).not.toBeUndefined();
        expect(i18nField1.init).not.toBeUndefined();
        expect(i18nField1.init.id).toEqual('newVariable_19_name');
        expect(i18nField1.init.value).toEqual('newVariable_19 name value');
        expect(i18nField1.init.dynamic).toEqual(false);
        const i18nField2 = model.getData('newVariable_20');
        expect(i18nField2).not.toBeUndefined();
        expect(i18nField2.init).not.toBeUndefined();
        expect(i18nField2.init.value).toEqual('newVariable_20 name value');
        expect(i18nField2.init.dynamic).toEqual(true);
        const i18nField3 = model.getData('newVariable_21');
        expect(i18nField3).not.toBeUndefined();
        expect(i18nField3.init).not.toBeUndefined();
        expect(i18nField3.init.id).toEqual('newVariable_21_name');
        log('Model data correct');

        expect(model.getI18ns().length).toEqual(3);
        const i18ns = [
            MODEL_TITLE_ID,
            'role_1_title',
            'role_2_title',
            'role_3_title',
            'role_4_title',
            'newVariable_2_title',
            'newVariable_2_placeholder',
            'newVariable_2_desc',
            'newVariable_2_valid_email',
            'p1_label',
            't1_label',
            't1_assign_message',
            't1_assign_title',
            't5_datagroup',
            'newVariable_3_value1',
            'newVariable_3_value2',
            'newVariable_3_value3',
            'newVariable_4_option_1',
            'newVariable_4_option_2',
            'newVariable_4_option_3',
            'newVariable_19_name',
            'case_create_message'
        ];
        assertI18n('uk', i18ns, model);
        assertI18n('de', i18ns, model);
        log('Model i18n correct');

        expect(model.getTransitions().length).toEqual(MODEL_TRANSITIONS_LENGTH);
        const transitionT1 = model.getTransition('t1');
        expect(transitionT1.title.id).toEqual('t1_label');
        expect(transitionT1.title.value).toEqual('Task escape:&<>');
        expect(transitionT1.icon).toEqual(MODEL_ICON);
        expect(transitionT1.assignPolicy).toEqual(AssignPolicy.AUTO);
        expect(transitionT1.finishPolicy).toEqual(FinishPolicy.AUTO_NO_DATA);
        expect(transitionT1.properties.size).toEqual(MODEL_TAGS_LENGTH);
        expect(transitionT1.properties.get(MODEL_TAGS_FIRST)).toEqual(MODEL_TAGS_FIRST);
        expect(transitionT1.properties.get(MODEL_TAGS_SECOND)).toEqual(MODEL_TAGS_SECOND);
        const t1AssignEvent = transitionT1.eventSource.getEvent(TransitionEventType.ASSIGN);
        expect(t1AssignEvent.id).toEqual('assign');
        expect(t1AssignEvent.title.value).toEqual('t1_assign_title_value');
        expect(t1AssignEvent.title.id).toEqual('t1_assign_title');
        expect(t1AssignEvent.message.value).toEqual('t1_assign_message_value');
        expect(t1AssignEvent.message.id).toEqual('t1_assign_message');
        expect(t1AssignEvent.preActions.length).toEqual(1);
        expect(t1AssignEvent.preActions[0].definition).toContain('test("t1_assign_pre")');
        expect(t1AssignEvent.postActions.length).toEqual(1);
        expect(t1AssignEvent.postActions[0].definition).toContain('test("t1_assign_post")');
        const t1FinishEvent = transitionT1.eventSource.getEvent(TransitionEventType.FINISH);
        expect(t1FinishEvent.id).toEqual('finish');
        expect(t1FinishEvent.preActions.length).toEqual(1);
        expect(t1FinishEvent.preActions[0].definition).toContain('test("t1_finish_pre")');
        expect(t1FinishEvent.postActions.length).toEqual(1);
        expect(t1FinishEvent.postActions[0].definition).toContain('test("t1_finish_post")');
        const t1CancelEvent = transitionT1.eventSource.getEvent(TransitionEventType.CANCEL);
        expect(t1CancelEvent.id).toEqual('cancel');
        expect(t1CancelEvent.preActions.length).toEqual(1);
        expect(t1CancelEvent.preActions[0].definition).toContain('test("t1_cancel_pre")');
        expect(t1CancelEvent.postActions.length).toEqual(1);
        expect(t1CancelEvent.postActions[0].definition).toContain('test("t1_cancel_post")');
        const t1ReassignEvent = transitionT1.eventSource.getEvent(TransitionEventType.REASSIGN);
        expect(t1ReassignEvent.id).toEqual('delegate');
        expect(t1ReassignEvent.preActions.length).toEqual(1);
        expect(t1ReassignEvent.preActions[0].definition).toContain('test("t1_delegate_pre")');
        expect(t1ReassignEvent.postActions.length).toEqual(1);
        expect(t1ReassignEvent.postActions[0].definition).toContain('test("t1_delegate_post")');

        const transitionT5 = model.getTransition('t5');
        expect(transitionT5.scope).toEqual(ResourceScope.USECASE);
        expect(transitionT5.grid).toBeUndefined();
        // flex
        const t5Flex = transitionT5.flex;
        expect(t5Flex).toBeDefined();
        expect(t5Flex.id).toEqual('t5_flex');
        expect(t5Flex.items).toBeDefined();
        expect(t5Flex.items.length).toEqual(15);
        expect(t5Flex.getItemById('newVariable_1').dataRef).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_1').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_1').dataRef.logic.immediate).toBeTruthy();
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvents().length).toEqual(2);
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvent(DataEventType.SET).preActions.length).toEqual(1);
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvent(DataEventType.SET).preActions[0].definition).toContain('test("t5_newVariable_1_set_pre")');
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvent(DataEventType.SET).postActions.length).toEqual(2);
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvent(DataEventType.SET).postActions[0].definition).toContain('test("t5_newVariable_1_set_post")');
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvent(DataEventType.GET).preActions.length).toEqual(2);
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvent(DataEventType.GET).preActions[0].definition).toContain('test("t5_newVariable_1_get_pre")');
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvent(DataEventType.GET).postActions.length).toEqual(1);
        expect(t5Flex.getItemById('newVariable_1').dataRef.getEvent(DataEventType.GET).postActions[0].definition).toContain('test("t5_newVariable_1_get_post")');

        expect(t5Flex.getItemById('newVariable_2').dataRef).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_2').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_2').properties.order).toEqual(0);
        expect(t5Flex.getItemById('newVariable_2').properties.flexGrow).toEqual(0);
        expect(t5Flex.getItemById('newVariable_2').properties.flexShrink).toEqual(1);
        expect(t5Flex.getItemById('newVariable_2').properties.flexBasis).toEqual('auto');
        expect(t5Flex.getItemById('newVariable_2').properties.alignSelf).toEqual(FlexItemAlignSelf.AUTO);

        expect(t5Flex.getItemById('newVariable_3').dataRef).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_3').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_3').properties.flex).toBeUndefined();

        expect(t5Flex.getItemById('newVariable_4').dataRef).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_4').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_4').properties).toBeDefined();
        expect(t5Flex.getItemById('newVariable_4').properties.order).toEqual(0);
        expect(t5Flex.getItemById('newVariable_4').properties.flexGrow).toEqual(0);
        expect(t5Flex.getItemById('newVariable_4').properties.flexShrink).toEqual(1);
        expect(t5Flex.getItemById('newVariable_4').properties.flexBasis).toEqual('auto');
        expect(t5Flex.getItemById('newVariable_4').properties.flex).toBeUndefined();
        expect(t5Flex.getItemById('newVariable_4').properties.alignSelf).toEqual(FlexItemAlignSelf.AUTO);

        expect(t5Flex.getItemById('newVariable_5').dataRef).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_5').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_5').dataRef.logic.required).toBeFalsy();

        expect(t5Flex.getItemById('newVariable_6').dataRef).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_6').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_6').dataRef.logic.required).toBeFalsy();

        expect(t5Flex.getItemById('newVariable_8')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_8').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_11')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_11').dataRef.logic.behavior).toEqual(DataRefBehavior.HIDDEN);
        expect(t5Flex.getItemById('newVariable_7')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_7').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_12')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_12').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_13')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_13').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_9')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_9').dataRef.logic.behavior).toEqual(DataRefBehavior.VISIBLE);
        expect(t5Flex.getItemById('newVariable_9').dataRef.logic.required).toBeTruthy();
        expect(t5Flex.getItemById('newVariable_10')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_10').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5Flex.getItemById('newVariable_10').dataRef.logic.required).toBeTruthy();
        expect(t5Flex.getItemById('newVariable_14')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_14').dataRef.logic.behavior).toEqual(DataRefBehavior.VISIBLE);
        expect(t5Flex.getItemById('newVariable_15')).not.toBeUndefined();
        expect(t5Flex.getItemById('newVariable_15').dataRef.logic.behavior).toEqual(DataRefBehavior.EDITABLE);

        const transitionT6 = model.getTransition('t6');
        expect(transitionT6.triggers.length === 1);
        const transitionT6AutoTrigger = transitionT6.triggers[0];
        expect(transitionT6AutoTrigger.type).toEqual(TriggerType.AUTO);

        const transitionT7 = model.getTransition('t7');
        expect(transitionT7.triggers.length === 1);
        const transitionT7AutoTrigger = transitionT7.triggers[0];
        expect(transitionT7AutoTrigger.type).toEqual(TriggerType.TIME);
        expect(transitionT7AutoTrigger.exact).toEqual(new Date(TIME_TRIGGER_EXACT));

        const transitionT8 = model.getTransition('t8');
        expect(transitionT8.triggers.length === 1);
        const transitionT8AutoTrigger = transitionT8.triggers[0];
        expect(transitionT8AutoTrigger.type).toEqual(TriggerType.TIME);
        expect(transitionT8AutoTrigger.delay).toEqual(TIME_TRIGGER_DELAY);

        const transitionT9 = model.getTransition('t9_datarefs_without_group');
        expect(transitionT9.roleRefs.length).toEqual(2);
        const transitionT9RoleRef1 = transitionT9.roleRefs.find(r => r.id === ROLE_1_ID);
        assertRoleRefLogic(transitionT9RoleRef1, false, false, true, true, true);
        const transitionT9RoleRef2 = transitionT9.roleRefs.find(r => r.id === ROLE_2_ID);
        assertRoleRefLogic(transitionT9RoleRef2, undefined, undefined, false, true, undefined);

        const transitionT10 = model.getTransition('t10');
        expect(transitionT10).toBeDefined();

        const transitionT11 = model.getTransition('t11');
        expect(transitionT11).toBeDefined();

        const transitionT12 = model.getTransition('t12');
        expect(transitionT12).toBeDefined();

        const transitionPredefinedRoles = model.getTransition('predefined_roles');
        expect(transitionPredefinedRoles.roleRefs.length).toEqual(2);
        const transitionPredefinedRolesDefault = transitionPredefinedRoles.roleRefs.find(r => r.id === Role.DEFAULT);
        assertRoleRefLogic(transitionPredefinedRolesDefault, false, false, true, true, undefined);
        const transitionPredefinedRolesAnonymous = transitionPredefinedRoles.roleRefs.find(r => r.id === 'anonymous');
        assertRoleRefLogic(transitionPredefinedRolesAnonymous, true, undefined, false, false, false);
        log('Model transitions correct');

        expect(model.getPlaces().length).toEqual(MODEL_PLACES_LENGTH);
        assertPlace(model.getPlace('p1'), 'p1', 300, 180, 'place 1', 0, false, 'p1_label');
        assertPlace(model.getPlace('p2'), 'p2', 380, 100, '', 3, false, '');
        assertPlace(model.getPlace('p3'), 'p3', 620, 180, '', 0, false, '');
        assertPlace(model.getPlace('p4'), 'p4', 300, 260, '', 2, false, '');
        assertPlace(model.getPlace('p5'), 'p5', 300, 340, '', 0, false, '');
        assertPlace(model.getPlace('p6'), 'p6', 300, 420, '', 0, false, '');
        assertPlace(model.getPlace('p7'), 'p7', 620, 260, '', 0, false, '');
        assertPlace(model.getPlace('p8'), 'p8', 620, 340, '', 0, false, '');
        assertPlace(model.getPlace('p9'), 'p9', 620, 420, '', 0, false, '');
        assertPlace(model.getPlace('p10'), 'p10', 540, 100, '', 0, false, '');
        log('Model places correct');

        // TODO: PF-75 arc count?
        expect(model.getArcs().length).toEqual(MODEL_ARCS_LENGTH);
        assertArc(model.getArc('a1'), 'a1', ArcType.REGULAR_PT, 'p1', 't1', {
            dynamic: true,
            expression: 'p2'
        });
        assertArc(model.getArc('a2'), 'a2', ArcType.REGULAR_TP, 't1', 'p3', {
            dynamic: true,
            expression: 'newVariable_1'
        });
        assertArc(model.getArc('a3'), 'a3', ArcType.RESET, 'p4', 't2');
        assertArc(model.getArc('a4'), 'a4', ArcType.INHIBITOR, 'p5', 't3');
        assertArc(model.getArc('a5'), 'a5', ArcType.READ, 'p6', 't4');
        assertArc(model.getArc('a6'), 'a6', ArcType.REGULAR_TP, 't2', 'p7', {
            dynamic: false,
            expression: '20'
        });
        assertArc(model.getArc('a7'), 'a7', ArcType.REGULAR_TP, 't3', 'p8');
        assertArc(model.getArc('a8'), 'a8', ArcType.REGULAR_TP, 't4', 'p9');
        assertArc(model.getArc('a9'), 'a9', ArcType.REGULAR_PT, 'p1', 't2');
        assertArc(model.getArc('a10'), 'a10', ArcType.REGULAR_PT, 'p4', 't3');
        assertArc(model.getArc('a11'), 'a11', ArcType.REGULAR_PT, 'p5', 't4');
        assertArc(model.getArc('a12'), 'a12', ArcType.REGULAR_PT, 'p6', 't3');
        assertArc(model.getArc('a13'), 'a13', ArcType.REGULAR_PT, 'p5', 't2');
        assertArc(model.getArc('a14'), 'a14', ArcType.REGULAR_TP, 't2', 'p8');
        assertArc(model.getArc('a15'), 'a15', ArcType.REGULAR_TP, 't2', 'p3');
        log('Model arcs correct');
    }

    function assertCorrectExport(xml) {
        expect(xml).not.toContain('t2_finish');
        expect(xml).not.toContain('t2_assign');
        expect(xml).not.toContain('t2_cancel');
        expect(xml).not.toContain('t2_reassign');
        log('Empty events not exported correctly');
    }

    function importAndExport(xml, errors = 0, warnings = 0, info = 0) {
        const modelResult = importService.parseFromXml(xml);
        expect(modelResult.errors.length).toEqual(errors);
        expect(modelResult.warnings.length).toEqual(warnings);
        expect(modelResult.info.length).toEqual(info);
        const model = modelResult.model;
        assertCorrectImport(model);
        const cloned = model.clone();
        assertCorrectImport(cloned);
        log('Import successful');
        const exported = exportService.exportXml(model);
        log(exported);
        assertCorrectExport(exported);
        log('Export successful');
        return exported;
    }

    function log(message) {
        if (debug) {
            console.log(message);
        }
    }

    function prettyFormat(model) {
        const indentationSymbol = '\t';
        const newLineSymbol = '\n';
        const prettyModel = format(model, {
            indentation: indentationSymbol,
            lineSeparator: newLineSymbol,
            collapseContent: true,
            forceSelfClosingEmptyTag: true,
        });
        return prettyModel.replace(new RegExp(`^(\\s*)([\\S ]*?)<!\\[CDATA\\[${newLineSymbol}([\\s\\S]*?)]]>(\\S*?)$`, 'gm'), (match, tagIndent, startingTag, code, endingTag) => {
            const contentIndent = `${tagIndent}${indentationSymbol}`;
            const indentedCode = code.replace(/^([\s\S]*?)$/gm, `${contentIndent}$&`);
            return `${tagIndent}${startingTag}${newLineSymbol}${contentIndent}<![CDATA[${newLineSymbol}${indentedCode}]]>${newLineSymbol}${tagIndent}${endingTag}`;
        });
    }
});
