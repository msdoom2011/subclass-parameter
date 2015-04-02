/**
 * @class
 * @constructor
 */
Subclass.Parameter.Extension.ConfigManagerExtension = function() {

    function ConfigManagerExtension(classInst)
    {
        ConfigManagerExtension.$parent.apply(this, arguments);
    }

    ConfigManagerExtension.$parent = Subclass.Extension;


    //=========================================================================
    //========================== ADDING NEW METHODS ===========================
    //=========================================================================

    var ConfigManager = Subclass.ConfigManager;

    /**
     * Registers new parameters or redefines already existent with the same name.
     *
     * @method setParameters
     * @memberOf Subclass.ConfigManager.prototype
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
     * var moduleConfigs = moduleInst.getConfigManager();
     *
     * // setting new parameters
     * moduleConfigs.setParameters({
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
    ConfigManager.prototype.setParameters = function(parameters)
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
            parameterManager.registerParameter(
                paramName,
                parameters[paramName]
            );
        }
    };

    /**
     * Returns all registered parameters in the form in which they were set
     *
     * @method getParameters
     * @memberOf Subclass.ConfigManager.prototype
     *
     * @returns {Object}
     */
    ConfigManager.prototype.getParameters = function()
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
        ConfigManager = Subclass.Tools.buildClassConstructor(ConfigManager);

        if (!ConfigManager.hasExtension(ConfigManagerExtension)) {
            ConfigManager.registerExtension(ConfigManagerExtension);
        }
    });

    return ConfigManagerExtension;
}();