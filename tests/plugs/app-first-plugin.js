var appFirstPlugin = Subclass.createModule('appFirstPlugin', {
    plugin: true,
    parameters: {
        mode_bad_name: "prod"
    },
    onConfig: function() {
        console.log('fsjdklfjslkdf');
        //var parameterManager = this.getParameterManager();
        //parameterManager.renameParameter('mode_bad_name', 'mode');
        //console.log(Object.keys(parameterManager.getParameters()));
    }
});