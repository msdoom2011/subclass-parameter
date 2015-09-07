
describe("Checking SubclassJS initialization", function() {

    it ("", function() {
        expect(Subclass.issetPlugin('SubclassParameter')).toBe(true);
    });
});

describe("Checking parameters", function() {

    it ("existence", function() {
        expect(app.issetParameter('mode')).toBe(true);
        expect(app.issetParameter('foo')).toBe(true);
        expect(app.issetParameter('bar')).toBe(true);
        expect(app.issetParameter('param1')).toBe(true);
        expect(app.issetParameter('param2')).toBe(true);
        expect(app.issetParameter('param3')).toBe(true);
        expect(app.issetParameter('forth')).toBe(true);
    });

    it ("values", function() {
        var inst = app.createInstance();
        var container = inst.getParameterContainer();

        expect(app.getParameter('mode')).toBe('prod');
        expect(app.getParameter('foo')).toBe(false);
        expect(app.getParameter('bar')).toBe(30);
        expect(app.getParameter('param1')).toBe(10);
        expect(app.getParameter('param2')).toBe(20);
        expect(app.getParameter('param3')).toBe(35);
        expect(app.getParameter('forth')).toBe(true);

        expect(container.get('mode')).toBe('prod');
        expect(container.get('foo')).toBe(false);
        expect(container.get('bar')).toBe(30);
        expect(container.get('param1')).toBe(10);
        expect(container.get('param2')).toBe(20);
        expect(container.get('param3')).toBe(35);
        expect(container.get('forth')).toBe(true);

        expect(inst.getParser().parse('My mode is %mode%')).toBe('My mode is prod');
        expect(inst.getParser().parse('My foo has %foo% value')).toBe('My foo has false value');
        expect(inst.getParser().parse('%bar%')).toBe(30);
        expect(inst.getParser().parse('%param1%')).toBe(10);
        expect(inst.getParser().parse('%param2%')).toBe(20);
        expect(inst.getParser().parse('%param3%')).toBe(35);
        expect(inst.getParser().parse('%forth%')).toBe(true);
    });

    it ("not allowed actions", function() {
        expect(function() { app.setParameter('failParam', 20) }).toThrow();
    });
});