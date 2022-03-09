const {ImportService, ExportService, TransitionSimulation} = require('../../dist/petriflow');
const fs = require('fs');

const TEST_FILE_PATH = 'src/test/resources/simulation_task.xml';
const TEST_FILE_PATH_2 = 'src/test/resources/simulation_task_multiple.xml';

describe('Petriflow simulation tests', () => {
    let importService;
    let exportService;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
    });

    test('multiple input arcs', () => {
        const file = fs.readFileSync(TEST_FILE_PATH_2).toString();
        const result = importService.parseFromXml(file);

        const sim = new TransitionSimulation(result.model);
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
    });

    test('should import & export', () => {
        const file = fs.readFileSync(TEST_FILE_PATH).toString();
        const result = importService.parseFromXml(file);

        const sim = new TransitionSimulation(result.model);

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
    });
});
