// noinspection DuplicatedCode

const {
    ImportService,
    ExportService,
    BasicSimulation
} = require('../../dist/petriflow');
const fs = require('fs');

const SIMPLE_NET_FILE = 'src/test/resources/simulation_task.xml';

describe('Petriflow transition simulation tests', () => {
    let importService;
    let exportService;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
    });

    test('task event errors', () => {
        const file = fs.readFileSync(SIMPLE_NET_FILE).toString();
        const result = importService.parseFromXml(file);
        const sim = new BasicSimulation(result.model);

        sim.assign('t1');
        expect(() => {
            sim.fire('t1');
        }).toThrow();
        sim.cancel('t1');
        expect(() => {
            sim.finish('t1');
        }).toThrow();
        expect(() => {
            sim.cancel('t1');
        }).toThrow();
    });

    test('simple net', () => {
        const file = fs.readFileSync(SIMPLE_NET_FILE).toString();
        const result = importService.parseFromXml(file);

        const sim = new BasicSimulation(result.model);
        for (let i = 0; i < 3; i++) {
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(0);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.assign('t1');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(1);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(1);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.assign('t2');
            expect(sim.enabled().length).toEqual(3);
            expect(sim.assigned().length).toEqual(2);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(0);
            expect(sim.isEnabled('t1')).toEqual(false);
            expect(sim.isAssigned('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(false);
            expect(sim.isAssigned('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(true);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.cancel('t1');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(1);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(1);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.cancel('t2');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(0);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.assign('t6');
            expect(sim.enabled().length).toEqual(3);
            expect(sim.assigned().length).toEqual(1);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(0);
            expect(sim.isEnabled('t1')).toEqual(false);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(false);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(true);
            expect(sim.isEnabled('t6')).toEqual(true);
            expect(sim.isAssigned('t6')).toEqual(true);

            sim.cancel('t6');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(0);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);
            expect(sim.isAssigned('t6')).toEqual(false);

            sim.assign('t3');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(1);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isAssigned('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.finish('t3');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(0);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isAssigned('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.assign('t3');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(1);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isAssigned('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.finish('t3');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(0);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isAssigned('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);

            sim.assign('t6');
            sim.fire('t4');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(1);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(1);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isAssigned('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);
            expect(sim.isAssigned('t6')).toEqual(true);

            sim.cancel('t6');
            expect(sim.enabled().length).toEqual(5);
            expect(sim.assigned().length).toEqual(0);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(3);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isAssigned('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isAssigned('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isAssigned('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);
            expect(sim.isAssigned('t6')).toEqual(false);

            sim.reset();
        }
    });
});
