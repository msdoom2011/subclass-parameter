var appFirstPlugin = Subclass.createModule('appFirstPlugin', {
    plugin: true,
    parameters: {
        mode_bad_name: "prod"
    }
});

appFirstPlugin.onSetup(function() {
    var parameterManager = this.getParameterManager();
    parameterManager.renameParameter('mode_bad_name', 'mode');
});

