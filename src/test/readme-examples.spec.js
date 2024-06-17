const {
    ImportService,
    ExportService,
    PetriNet,
} = require('../../dist/petriflow');

describe('README Examples test', () => {

    test('should fetch petriflow file & import', done => {
        const https = require('https');
        // todo file needs to be updated according to new xsd
        https.get('https://raw.githubusercontent.com/netgrif/petriflow/main/examples/order-approval.xml', (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const net = new ImportService().parseFromXml(body);
                expect(net).toBeDefined();
                expect(net.model).toBeDefined();
                expect(net.model.id).toEqual("order_approval");
                expect(net.model.title.value).toEqual("Order approval")
                done();
            });
            res.on('error', (err => {
                console.error(err);
                done();
            }));
        });
    }, 10000);

    test('should export empty petriflow process', () => {
        const net = new PetriNet();
        const xml = new ExportService().exportXml(net);

        expect(xml).toBeDefined();
        expect(xml).toContain("<id>new_model</id>")
        expect(xml).not.toContain("<initials>NEW</initials>")
        expect(xml).not.toContain("<transitionRole>false</transitionRole>")
    });
});
