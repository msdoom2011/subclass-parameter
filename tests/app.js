var app = Subclass.createModule("app", {
    parameters: {
        mode: "dev",
        foo: true,
        bar: 10
    }
});

app.registerParameters({
    param1: 10,
    param2: 20
});

app.registerParameter('param3', 30);
app.setParameter('param3', 35);