/**
 * @class
 * @constructor
 */
Subclass.Parameter.Extension.SettingsManagerExtension = function() {

    function SettingsManagerExtension(classInst)
    {
        SettingsManagerExtension.$parent.apply(this, arguments);
    }

    SettingsManagerExtension.$parent = Subclass.Extension;


    //=========================================================================
    //========================== ADDING NEW METHODS ===========================
    //=========================================================================

    var SettingsManager = Subclass.SettingsManager;

    /**
     * Registers new parameters or redefines already existent with the same name.
     *
     * @method setParameters
     * @memberOf Subclass.SettingsManager.prototype
     *
     * @throws {Error}
     *      Throws error if trying to change value after the module became ready
     *
     * @param {Object} parameters
     *      A plain object with properties which hold
     *      properties whatever you need
     *
     * @example
     * ...
     *
     * var moduleSetting = moduleInst.getSettingsManager();
     *
     * // setting new parameters
     * moduleSettings.setParameters({
     *      param1: "string value",
     *      param2: 1000,
     *      param3: { a: 10, b: "str" },
     *      ...
     * });
     * ...
     *
     * moduleInst.getParameter("param1"); // returns "string value"
     * moduleInst.getParameter("param2"); // returns 1000
     * moduleInst.getParameter("param3"); // returns { a: 10, b: "str" }
     * ...
     */
    SettingsManager.prototype.setParameters = function(parameters)
    {
        this.checkModuleIsReady();

        if (!parameters || !Subclass.Tools.isPlainObject(parameters)) {
            Subclass.Error.create('InvalidModuleOption')
                .option('parameters')
                .module(this.getModule().getName())
                .received(parameters)
                .expected('a plain object')
                .apply()
            ;
        }
        var parameterManager = this.getModule().getParameterManager();

        for (var paramName in parameters) {
            if (!parameters.hasOwnProperty(paramName)) {
                continue;
            }
            parameterManager.register(
                paramName,
                parameters[paramName]
            );
        }
    };

    /**
     * Returns all registered parameters in the form in which they were set
     *
     * @method getParameters
     * @memberOf Subclass.SettingsManager.prototype
     *
     * @returns {Object}
     */
    SettingsManager.prototype.getParameters = function()
    {
        var parameters = this.getModule().getParameterManager().getParameters();
        var parameterDefinitions = {};

        for (var i = 0; i < parameters.length; i++) {
            var parameterValue = parameters[i].getValue();
            var parameterName = parameters[i].getName();

            parameterDefinitions[parameterName] = Subclass.Tools.copy(parameterValue);
        }
        return parameterDefinitions;
    };


    //=========================================================================
    //======================== REGISTERING EXTENSION ==========================
    //=========================================================================

    Subclass.Module.onInitializeBefore(function(evt, module)
    {
        SettingsManager = Subclass.Tools.buildClassConstructor(SettingsManager);

        if (!SettingsManager.hasExtension(SettingsManagerExtension)) {
            SettingsManager.registerExtension(SettingsManagerExtension);
        }
    });

    return SettingsManagerExtension;
}();