const {
    ImportService,
    ExportService,
    Simulation
} = require('../../dist/petriflow');
const fs = require('fs');

const TEST_FILE_PATH = 'src/test/resources/simulation_transition.xml';
const MULTIPLE_INPUT_ARCS_PATH = 'src/test/resources/simulation_transition_multiple.xml';
const TASK_SEQUENCE_PATH = 'src/test/resources/simulation_sequence.xml';
const REF_DATA_PATH = 'src/test/resources/simulation_ref_data.xml';

describe('Petriflow transition simulation tests', () => {
    let importService;
    let exportService;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
    });

    test('data reference', () => {
        const file = fs.readFileSync(REF_DATA_PATH).toString();
        const result = importService.parseFromXml(file);

        const sim = new Simulation(result.model);
        for (let i = 0; i < 3; i++) {
            expect(sim.enabled().length).toEqual(1);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(false);

            sim.fire('t1');
            expect(sim.enabled().length).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(1);

            sim.updateData(new Map([['input', 5], ['output', 3]]));
            expect(sim.enabled().length).toEqual(1);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(false);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(1);
            sim.fire('t1');
            expect(sim.enabled().length).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.simulationModel.getPlace('p1').marking).toEqual(6);

            sim.reset();
            sim.updateData(new Map([['input', 1], ['output', 1]]));
        }
    });

    test('task sequence', () => {
        const file = fs.readFileSync(TASK_SEQUENCE_PATH).toString();
        const result = importService.parseFromXml(file);

        const sim = new Simulation(result.model);
        for (let i = 0; i < 3; i++) {
            expect(sim.enabled().length).toEqual(2);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(true);
            sim.fire('t1');

            expect(sim.enabled().length).toEqual(3);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(true);
            sim.fire('t2');

            expect(sim.enabled().length).toEqual(3);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(true);
            sim.fire('t3');

            expect(sim.enabled().length).toEqual(3);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t5')).toEqual(true);
            sim.fire('t4');

            expect(sim.enabled().length).toEqual(3);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t6')).toEqual(true);
            sim.fire('t4');

            expect(sim.enabled().length).toEqual(3);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t6')).toEqual(true);
            sim.fire('t6');

            expect(sim.enabled().length).toEqual(3);
            expect(sim.isEnabled('t3')).toEqual(true);
            expect(sim.isEnabled('t4')).toEqual(true);
            expect(sim.isEnabled('t6')).toEqual(true);

            expect(sim.simulationModel.getPlace('p1').marking).toEqual(0);
            expect(sim.simulationModel.getPlace('p2').marking).toEqual(0);
            expect(sim.simulationModel.getPlace('p3').marking).toEqual(1);
            expect(sim.simulationModel.getPlace('p4').marking).toEqual(1);
            expect(sim.simulationModel.getPlace('p5').marking).toEqual(2);
            expect(sim.simulationModel.getPlace('p6').marking).toEqual(1);

            sim.reset();
        }
    });

    test('multiple input arcs', () => {
        const file = fs.readFileSync(MULTIPLE_INPUT_ARCS_PATH).toString();
        const result = importService.parseFromXml(file);

        const sim = new Simulation(result.model);
        for (let i = 0; i < 3; i++) {
            expect(sim.enabled().length).toEqual(3);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(true);

            sim.fire('t1');
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(true);

            sim.fire('t2');
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(true);

            sim.fire('t3');
            expect(sim.isEnabled('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(false);
            sim.reset();
        }
    });

    test('should import & export', () => {
        const file = fs.readFileSync(TEST_FILE_PATH).toString();
        const result = importService.parseFromXml(file);

        const sim = new Simulation(result.model);
        for (let i = 0; i < 3; i++) {
            expect(sim.enabled().length).toEqual(9);
            expect(sim.isEnabled('t1')).toEqual(true);
            expect(sim.isEnabled('t2')).toEqual(true);
            expect(sim.isEnabled('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(false);
            expect(sim.isEnabled('t5')).toEqual(true);
            expect(sim.isEnabled('t6')).toEqual(true);
            expect(sim.isEnabled('t7')).toEqual(false);
            expect(sim.isEnabled('t8')).toEqual(true);
            expect(sim.isEnabled('t9')).toEqual(false);
            expect(sim.isEnabled('t10')).toEqual(true);
            expect(sim.isEnabled('t11')).toEqual(true);
            expect(sim.isEnabled('t12')).toEqual(false);
            expect(sim.isEnabled('t13')).toEqual(true);
            expect(sim.isEnabled('t14')).toEqual(true);
            expect(sim.isEnabled('t15')).toEqual(false);

            let cannotFire = 0;
            for (let index = 1; index <= 15; index++) {
                try {
                    sim.fire(`t${index}`);
                } catch (e) {
                    cannotFire++;
                }
            }
            expect(cannotFire).toEqual(6);
            expect(sim.enabled().length).toEqual(7);
            expect(sim.isEnabled('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(false);
            expect(sim.isEnabled('t5')).toEqual(true);
            expect(sim.isEnabled('t6')).toEqual(true);
            expect(sim.isEnabled('t7')).toEqual(false);
            expect(sim.isEnabled('t8')).toEqual(true);
            expect(sim.isEnabled('t9')).toEqual(false);
            expect(sim.isEnabled('t10')).toEqual(true);
            expect(sim.isEnabled('t11')).toEqual(true);
            expect(sim.isEnabled('t12')).toEqual(false);
            expect(sim.isEnabled('t13')).toEqual(true);
            expect(sim.isEnabled('t14')).toEqual(true);
            expect(sim.isEnabled('t15')).toEqual(false);

            cannotFire = 0;
            for (let index = 1; index <= 15; index++) {
                try {
                    sim.fire(`t${index}`);
                } catch (e) {
                    cannotFire++;
                }
            }
            expect(cannotFire).toEqual(8);
            expect(sim.enabled().length).toEqual(6);
            expect(sim.isEnabled('t1')).toEqual(false);
            expect(sim.isEnabled('t2')).toEqual(false);
            expect(sim.isEnabled('t3')).toEqual(false);
            expect(sim.isEnabled('t4')).toEqual(false);
            expect(sim.isEnabled('t5')).toEqual(false);
            expect(sim.isEnabled('t6')).toEqual(true);
            expect(sim.isEnabled('t7')).toEqual(false);
            expect(sim.isEnabled('t8')).toEqual(true);
            expect(sim.isEnabled('t9')).toEqual(false);
            expect(sim.isEnabled('t10')).toEqual(true);
            expect(sim.isEnabled('t11')).toEqual(true);
            expect(sim.isEnabled('t12')).toEqual(false);
            expect(sim.isEnabled('t13')).toEqual(true);
            expect(sim.isEnabled('t14')).toEqual(true);
            expect(sim.isEnabled('t15')).toEqual(false);
            sim.reset();
        }
    });
});
