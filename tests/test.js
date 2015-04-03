
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
        expect(app.getParameter('mode')).toBe('prod');
        expect(app.getParameter('foo')).toBe(false);
        expect(app.getParameter('bar')).toBe(30);
        expect(app.getParameter('param1')).toBe(10);
        expect(app.getParameter('param2')).toBe(20);
        expect(app.getParameter('param3')).toBe(35);
        expect(app.getParameter('forth')).toBe(true);
    });

    it ("not allowed actions", function() {
        expect(function() { app.setParameter('failParam', 20) }).toThrow();
    });
});