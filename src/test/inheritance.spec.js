const {
    ImportService,
    ExportService,
    ProcessEventType,
    CaseEventType,
    BasicSimulation
} = require("../../dist/petriflow");
const fs = require('fs');
const {beforeEach, describe, expect, test} = require('@jest/globals');

const INHERITANCE_TEST_NETS_DIRECTORY = 'src/test/resources/inheritance/';
const ERROR_INHERITANCE_TEST_NETS_DIRECTORY = INHERITANCE_TEST_NETS_DIRECTORY + 'errors/';
const CHILD_NET_FILE_PATH = INHERITANCE_TEST_NETS_DIRECTORY + 'child_net.xml';
const PARENT_NET_FILE_PATH = 'src/test/resources/petriflow_test.xml';

describe('Petriflow inheritance tests', () => {

    let importService;
    let exportService;
    let parentNet;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
        parentNet = importService.parseFromXml(fs.readFileSync(PARENT_NET_FILE_PATH).toString()).model;
    });

    test('should fail to import child nets containing object with same identifiers as in parent net', () => {
        fs.readdirSync(ERROR_INHERITANCE_TEST_NETS_DIRECTORY).forEach((file) => {
            expect(() => {
                importService.parseFromXml(fs.readFileSync(ERROR_INHERITANCE_TEST_NETS_DIRECTORY + file).toString(), parentNet);
            }).toThrow();
        });
    });

    test('should set child net metadata correctly', () => {
        const childModel = importChildModel().merge();
        expect(childModel.id).toEqual("child_net");
        expect(childModel.version).toEqual("2");
        expect(childModel.extends.id).toEqual("petriflow_test");
        expect(childModel.extends.version).toEqual("1");
        expect(childModel.title.value).toEqual("Child net");
        expect(childModel.icon).toEqual("test_child_icon");
        expect(childModel.defaultRole).toEqual(true);
        expect(childModel.anonymousRole).toEqual(true);
        expect(childModel.caseName.value).toEqual("child case");
        expect(childModel.parentModel.id).toEqual("petriflow_test");
    });

    test('should merge parent and child nets', () => {
        const childModel = importChildModel();
        const mergedModel = childModel.merge();

        const childNetIdentifierIndex = createIdentifierIndex(childModel);
        const parentNetIdentifierIndex = createIdentifierIndex(parentNet);
        const mergedNetIdentifierIndex = createIdentifierIndex(mergedModel);

        const childInheritedIdentifiersLength = childNetIdentifierIndex.filter(identifier => mergedNetIdentifierIndex.includes(identifier)).length;
        const parentInheritedIdentifiersLength = parentNetIdentifierIndex.filter(identifier => mergedNetIdentifierIndex.includes(identifier)).length;

        expect(mergedNetIdentifierIndex.length).toEqual(parentNetIdentifierIndex.length + childNetIdentifierIndex.length);
        expect(parentInheritedIdentifiersLength).toEqual(parentNetIdentifierIndex.length);
        expect(childInheritedIdentifiersLength).toEqual(childNetIdentifierIndex.length);
        expect(mergedModel.functions.length).toEqual(3);
        expect(mergedModel.getRoleRefs().length).toEqual(7);
        expect(mergedModel.getProcessEvent(ProcessEventType.UPLOAD).preActions.length).toEqual(2);
        expect(mergedModel.getProcessEvent(ProcessEventType.UPLOAD).postActions.length).toEqual(2);
        expect(mergedModel.getCaseEvent(CaseEventType.CREATE).preActions.length).toEqual(2);
        expect(mergedModel.getCaseEvent(CaseEventType.CREATE).postActions.length).toEqual(2);
        expect(mergedModel.getCaseEvent(CaseEventType.DELETE).preActions.length).toEqual(2);
        expect(mergedModel.getCaseEvent(CaseEventType.DELETE).postActions.length).toEqual(2);
    });

    test('arcs with inherited elements should work as normal', () => {
        const childModel = importChildModel();
        const sim = new BasicSimulation(childModel);
        sim.updateData(new Map([['newVariable_1',5],['p2',3]]))
        for (let i = 0; i < 3; i++) {
            sim.fire('trans1');
            expect(sim.simulationModel.getPlace('place1').marking).toEqual(1);
            expect(sim.simulationModel.getPlace('p10').marking).toEqual(1);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(5);
            sim.fire('t1');
            expect(sim.simulationModel.getPlace('place1').marking).toEqual(2);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(2);
            expect(sim.simulationModel.getPlace('p3').marking).toEqual(5);
            expect(sim.simulationModel.getPlace('place2').marking).toEqual(3);
            expect(sim.simulationModel.getPlace('p7').marking).toEqual(5);
            sim.fire('t5');
            expect(sim.simulationModel.getPlace('p10').marking).toEqual(0);
            sim.fire('trans1');
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(7);
            expect(sim.simulationModel.getPlace('place1').marking).toEqual(1);
            sim.fire('t1');
            expect(sim.simulationModel.getPlace('p7').marking).toEqual(10);
            expect(sim.simulationModel.getPlace('place1').marking).toEqual(2);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(4);
            sim.reset();
        }
    })

    function createIdentifierIndex(net) {
        const identifierIndex = [];
        ['_roles', '_data', '_transitions', '_places', '_arcs'].forEach(netAttribute => {
            identifierIndex.push(...Array.from((net[netAttribute]).keys()));
        });
        const i18Set = new Set();
        net.getI18ns().forEach(translations => {
            i18Set.add(...Array.from(translations._i18ns.keys));
        });
        identifierIndex.push(...i18Set);
        return identifierIndex;
    }

    function importChildModel() {
        return importService.parseFromXml(fs.readFileSync(CHILD_NET_FILE_PATH).toString(), parentNet).model;
    }
});
