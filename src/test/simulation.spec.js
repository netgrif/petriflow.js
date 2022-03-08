const {ImportService, ExportService, TransitionSimulation} = require('../../dist/petriflow');
const fs = require('fs');

const TEST_FILE_PATH = 'src/test/resources/simulation_task.xml';

describe('Petriflow simulation tests', () => {
    let importService;
    let exportService;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
    });

    test('should import & export', () => {
        const file = fs.readFileSync(TEST_FILE_PATH).toString();
        const result = importService.parseFromXml(file);

        const sim = new TransitionSimulation(result.model);

        expect(sim.enabled().length).toEqual(3);
        expect(sim.isEnabled('t1')).toEqual(true);
        expect(sim.isEnabled('t2')).toEqual(true);
        expect(sim.isEnabled('t3')).toEqual(false);
        expect(sim.isEnabled('t4')).toEqual(false);
        expect(sim.isEnabled('t5')).toEqual(true);
    });
});
