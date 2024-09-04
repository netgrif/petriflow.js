const {ImportService, ExportService} = require("../../dist/petriflow.js");
const fs = require('fs');
const {beforeEach, describe, test} = require("@jest/globals");

describe('Petriflow legacy model import tests', () => {
    let importService;
    let exportService;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
    });

    test('request model test', () => {
        const resources = 'src/test/resources';
        const fileName = '';
        const file = fs.readFileSync(`${resources}/${fileName}.xml`).toString();
        const result = importService.parseFromXml(file);
        const exported = exportService.exportXml(result.model);
        console.log(result.info);
        console.log(result.warnings);
        console.log(result.errors);
        console.log(exported);
        fs.writeFileSync(`${resources}/${fileName}_new.xml`, exported);
    });
});
