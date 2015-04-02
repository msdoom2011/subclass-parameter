describe("Testing", function() {
    it ("parameters get", function() {
        expect(app.getParameter('mode')).toBe('dev');
        expect(app.getParameter('foo')).toBe(true);
        expect(app.getParameter('bar')).toBe(10);
    });
});