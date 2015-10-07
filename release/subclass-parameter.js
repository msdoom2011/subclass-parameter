/**
 * SubclassParameter - v0.1.0 - 2015-10-07
 * https://github.com/msdoom2011/subclassjs
 *
 * Copyright (c) 2015 Dmitriy Osipishin | msdoom2011@gmail.com
 */
(function() {
"use strict";

/**
 * @namespace
 */
Subclass.Parameter = {};

/**
 * @namespace
 */
Subclass.Parameter.Extension = {};

/**
 * @class
 * @constructor
 * @description
 *
 * Instance of current class is used to managing of parameters:
 * registering new parameters, setting and getting their values.
 *
 * @throws {Error}
 *      Throws error if specified not valid module instance
 *
 * @param {Subclass.Module} module
 *      The module instance
 */
Subclass.Parameter.ParameterManager = (function()
{
    /**
     * @alias Subclass.Parameter.ParameterManager
     */
    function ParameterManager(module)
    {
        if (!module || !(module instanceof Subclass.Module)) {
            Subclass.Error.create('InvalidArgument')
                .argument("the module instance", false)
                .received(module)
                .expected('an instance of "Subclass.Module" class')
                .apply()
            ;
        }

        /**
         * Instance of module
         *
         * @type {Subclass.Module}
         * @private
         */
        this._module = module;

        /**
         * Collection of parameters
         *
         * @type {Object.<Subclass.Parameter.Parameter>}
         * @private
         */
        this._parameters = {};
    }

    /**
     * Returns module instance
     *
     * @method getModule
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @returns {Subclass.Module}
     */
    ParameterManager.prototype.getModule = function()
    {
        return this._module;
    };

    /**
     * Returns collection of registered parameters
     *
     * @method getParameters
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @param {boolean} [privateParameters=false]
     *      If specified true it returns parameters only from current module
     *      without parameters from its plug-in modules
     *
     * @param {boolean} [withParentParameters=true]
     *      Should or not will be returned the parameters from the parent
     *      modules (it is actual if the current module is a plug-in)
     *
     * @returns {Object}
     */
    ParameterManager.prototype.getParameters = function(privateParameters, withParentParameters)
    {
        var mainModule = this.getModule();
        var moduleManager = mainModule.getModuleStorage();
        var parameters = {};
        var $this = this;

        if (privateParameters !== true) {
            privateParameters = false;
        }
        if (withParentParameters !== false) {
            withParentParameters = true;
        }

        // Returning parameters from current module with parameters from its parent modules

        if (!privateParameters && withParentParameters && !mainModule.isRoot() && arguments[2] != mainModule) {
            return mainModule.getRoot().getParameterManager().getParameters(false, false, mainModule);

            // Returning parameters from current module (without its plug-ins)

        } else if (privateParameters) {
            return this._parameters;
        }

        moduleManager.eachModule(function(module) {
            if (module == mainModule) {
                Subclass.Tools.extend(parameters, $this.getParameters(true, false));
                return;
            }
            var moduleParameterManager = module.getParameterManager();
            var moduleParameters = moduleParameterManager.getParameters(false, false);

            Subclass.Tools.extend(
                parameters,
                moduleParameters
            );
        });

        return parameters;
    };

    /**
     * Returns module names where is defined parameter with specified name.<br /><br />
     *
     * @method getLocations
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @param {string} parameterName
     *      The name of interesting parameter
     *
     * @returns {string[]}
     */
    ParameterManager.prototype.getLocations = function(parameterName)
    {
        var mainModule = this.getModule().getRoot();
        var locations = [];

        if (arguments[1]) {
            mainModule = arguments[1];
        }
        var moduleStorage = mainModule.getModuleStorage();

        moduleStorage.eachModule(function(module) {
            var parameterManager = module.getParameterManager();

            if (parameterManager.isset(parameterName, true)) {
                locations.push(module.getName());
            }
            if (module == mainModule) {
                return;
            }
            if (module.hasPlugins()) {
                var pluginModuleStorage = module.getModuleStorage();
                var plugins = pluginModuleStorage.getPlugins();

                for (var i = 0; i < plugins.length; i++) {
                    var subPlugin = plugins[i];
                    var subPluginManager = subPlugin.getParameterManager();
                    var subPluginLocations = subPluginManager.getLocations(parameterName, subPlugin);

                    locations = locations.concat(subPluginLocations);
                }
            }
        });

        return locations;
    };

    /**
     * Registers new parameter.<br /><br />
     *
     * Creates instance of {@link Subclass.Parameter.Parameter}
     *
     * @method register
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @throws {Error}
     *      Throws error if trying to register new parameter
     *      after when module became ready.
     *
     * @param {string} paramName
     *      The name of the registered parameter
     *
     * @param {*} paramValue
     *      The value of the registered parameter
     */
    ParameterManager.prototype.register = function(paramName, paramValue)
    {
        if (this.getModule().isReady()) {
            Subclass.Error.create('Can\'t register new parameter when module is ready.');
        }
        this._parameters[paramName] = Subclass.Tools.createClassInstance(
            Subclass.Parameter.Parameter,
            paramName,
            paramValue
        );
    };

    /**
     * Renames parameter with old name to the new one
     *
     * @method rename
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @param {string} nameOld
     *      The old parameter name
     *
     * @param {string} nameNew
     *      The new parameter name
     */
    ParameterManager.prototype.rename = function(nameOld, nameNew)
    {
        if (!this.isset(nameOld)) {
            Subclass.Error.create('Trying to rename non existent parameter "' + nameOld + '".');
        }
        if (!nameNew || typeof nameNew != 'string') {
            Subclass.Error.create('InvalidError')
                .argument('the new parameter name', false)
                .expected('a string')
                .received(nameNew)
                .apply()
            ;
        }
        var moduleNames = this.getLocations(nameOld);

        for (var i = 0; i < moduleNames.length; i++) {
            var module = Subclass.getModule(moduleNames[i]);
            var parameterManager = module.getParameterManager();
            var parameters = parameterManager.getParameters(true);
            var parameter = parameters[nameOld];

            if (!parameter) {
                Subclass.Error.create(
                    'The work of method ' +
                    '"Subclass.Parameter.ParameterManager#getLocations" is incorrect.'
                );
            }
            delete parameters[nameOld];
            parameters[nameNew] = parameter;
            parameter.setName(nameNew);
        }
    };

    /**
     * Sets parameter value
     *
     * @method set
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @throws {Error}
     *      Throws error if:<br />
     *      - trying to change parameter value after when module became ready;<br />
     *      - trying to set value of non registered parameter.
     *
     * @param {string} paramName
     *      The name of the parameter
     *
     * @param {*} paramValue
     *      The new value of the parameter
     */
    ParameterManager.prototype.set = function(paramName, paramValue)
    {
        if (this.getModule().isReady()) {
            Subclass.Error.create('Can\'t change parameter value when module is ready.');
        }
        if (!this.isset(paramName)) {
            Subclass.Error.create('Parameter with name "' + paramName + '" not exists.');
        }
        this._parameters[paramName].setValue(paramValue);
    };

    /**
     * Returns parameter value
     *
     * @method get
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @throws {Error}
     *      Throws error if trying to get non registered parameter
     *
     * @param {string} paramName
     *      The name of the parameter
     *
     * @return {*}
     */
    ParameterManager.prototype.get = function(paramName)
    {
        if (!this.isset(paramName)) {
            Subclass.Error.create('Parameter with name "' + paramName + '" not exists.');
        }
        return this.getParameters()[paramName].getValue();
    };

    /**
     * Checks whether parameter with passed name is exists
     *
     * @method isset
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @param {string} paramName
     *      The name of interesting parameter
     *
     * @param {boolean} privateParameters
     *      Should check parameter presence only in current module
     *      or also try to search in its plug-ins.
     *
     * @returns {boolean}
     */
    ParameterManager.prototype.isset = function(paramName, privateParameters)
    {
        return !!this.getParameters(privateParameters)[paramName];
    };

    return ParameterManager;

})();

// Source file: Extension/ModuleAPIExtension.js

/**
 * @class
 * @constructor
 */
Subclass.Parameter.Extension.ModuleAPIExtension = function() {

    function ModuleAPIExtension(classInst)
    {
        ModuleAPIExtension.$parent.apply(this, arguments);
    }

    ModuleAPIExtension.$parent = Subclass.Extension;


    //=========================================================================
    //========================== ADDING NEW METHODS ===========================
    //=========================================================================

    var ModuleAPI = Subclass.ModuleAPI;

    /**
     * The same as the {@link Subclass.Module#getParameterManager}
     *
     * @method getParameterManager
     * @memberOf Subclass.ModuleAPI.prototype
     */
    ModuleAPI.prototype.getParameterManager = function()
    {
        return this.getModule().getParameterManager.apply(this.getModule(), arguments);
    };

    /**
     * The same as the {@link Subclass.Parameter.ParameterManager#register}
     *
     * @method registerParameter
     * @memberOf Subclass.ModuleAPI.prototype
     */
    ModuleAPI.prototype.registerParameter = function()
    {
        return this.getModule().getParameterManager().register.apply(
            this.getModule().getParameterManager(),
            arguments
        );
    };

    /**
     * The same as the {@link Subclass.SettingsManager#setParameters}
     *
     * @method registerParameters
     * @memberOf Subclass.ModuleAPI.prototype
     */
    ModuleAPI.prototype.registerParameters = function()
    {
        return this.getModule().getSettingsManager().setParameters.apply(
            this.getModule().getSettingsManager(),
            arguments
        );
    };

    /**
     * The same as the {@link Subclass.Parameter.ParameterManager#setParameter}
     *
     * @method setParameter
     * @memberOf Subclass.ModuleAPI.prototype
     */
    ModuleAPI.prototype.setParameter = function()
    {
        return this.getModule().getParameterManager().set.apply(
            this.getModule().getParameterManager(),
            arguments
        );
    };

    /**
     * The same as the {@link Subclass.Parameter.ParameterManager#get}
     *
     * @method getParameter
     * @memberOf Subclass.ModuleAPI.prototype
     */
    ModuleAPI.prototype.getParameter = function()
    {
        return this.getModule().getParameterManager().get.apply(
            this.getModule().getParameterManager(),
            arguments
        );
    };

    /**
     * The same as the {@link Subclass.Parameter.ParameterManager#issetParameter}
     *
     * @method issetParameter
     * @memberOf Subclass.ModuleAPI.prototype
     */
    ModuleAPI.prototype.issetParameter = function()
    {
        return this.getModule().getParameterManager().isset.apply(
            this.getModule().getParameterManager(),
            arguments
        );
    };


    //=========================================================================
    //======================== REGISTERING EXTENSION ==========================
    //=========================================================================

    Subclass.Module.onInitializeBefore(function(evt, module)
    {
        ModuleAPI = Subclass.Tools.buildClassConstructor(ModuleAPI);

        if (!ModuleAPI.hasExtension(ModuleAPIExtension)) {
            ModuleAPI.registerExtension(ModuleAPIExtension);
        }
    });

    return ModuleAPIExtension;
}();

// Source file: Extension/ModuleExtension.js

/**
 * @class
 * @constructor
 *
 * Module settings:
 *
 * parameters   {Object}    opt     Object with parameters which can
 *                                  be used by all over module.
 *
 *                                  It is useful for defining some
 *                                  setting parameters of
 *                                  application, i.e. debug mode.
 *
 *                                  Example:
 *
 *                                  var moduleSettings = {
 *                                    ...
 *                                    parameters: {
 *                                      mode: "dev",
 *                                      foo: 111,
 *                                      bar: true,
 *                                      ...
 *                                    },
 *                                    ...
 *                                  };
 */
Subclass.Parameter.Extension.ModuleExtension = function() {

    function ModuleExtension(classInst)
    {
        ModuleExtension.$parent.apply(this, arguments);
    }

    ModuleExtension.$parent = Subclass.Extension;

    /**
     * @inheritDoc
     */
    ModuleExtension.initialize = function(module)
    {
        this.$parent.initialize.apply(this, arguments);

        var eventManager = module.getEventManager();

        eventManager.getEvent('onInitialize').addListener(function(evt, module)
        {
            /**
             * Parameter manager instance
             *
             * @type {Subclass.Parameter.ParameterManager}
             * @private
             */
            this._parameterManager = Subclass.Tools.createClassInstance(
                Subclass.Parameter.ParameterManager,
                this
            );
        });
    };


    //=========================================================================
    //========================== ADDING NEW METHODS ===========================
    //=========================================================================

    var Module = Subclass.Module;

    /**
     * Returns an instance of parameter manager which allows to register parameters,
     * set and get its values throughout the project
     *
     * @method getParameterManager
     * @memberOf Subclass.Module.prototype
     *
     * @returns {Subclass.Parameter.ParameterManager}
     */
    Module.prototype.getParameterManager = function()
    {
        return this._parameterManager;
    };


    //=========================================================================
    //======================== REGISTERING EXTENSION ==========================
    //=========================================================================

    Subclass.Module.onInitializeBefore(function(evt, module)
    {
        Module = Subclass.Tools.buildClassConstructor(Module);

        if (!Module.hasExtension(ModuleExtension)) {
            Module.registerExtension(ModuleExtension);
        }
    });

    return ModuleExtension;
}();

// Source file: Extension/ModuleInstanceExtension.js

/**
 * @class
 * @constructor
 */
Subclass.Parameter.Extension.ModuleInstanceExtension = function() {

    function ModuleInstanceExtension(classInst)
    {
        ModuleInstanceExtension.$parent.apply(this, arguments);
    }

    ModuleInstanceExtension.$parent = Subclass.Extension;

    /**
     * @inheritDoc
     *
     * @param {Subclass.ModuleInstance} moduleInstance
     */
    ModuleInstanceExtension.initialize = function(moduleInstance)
    {
        ModuleInstanceExtension.$parent.initialize.apply(this, arguments);

        moduleInstance.getEvent('onInitialize').addListener(function() {

            /**
             * Instance of service container
             *
             * @type {Subclass.Service.ServiceContainer}
             * @private
             */
            this._parameterContainer = Subclass.Tools.createClassInstance(Subclass.Parameter.ParameterContainer, this);
        });
    };


    //=========================================================================
    //========================== ADDING NEW METHODS ===========================
    //=========================================================================

    var ModuleInstance = Subclass.ModuleInstance;

    /**
     * Returns instance of service container
     *
     * @returns {Subclass.Parameter.ParameterContainer}
     */
    ModuleInstance.prototype.getParameterContainer = function()
    {
        return this._parameterContainer;
    };


    //=========================================================================
    //======================== REGISTERING EXTENSION ==========================
    //=========================================================================

    Subclass.Module.onInitializeBefore(function(evt, module)
    {
        ModuleInstance = Subclass.Tools.buildClassConstructor(ModuleInstance);

        if (!ModuleInstance.hasExtension(ModuleInstanceExtension)) {
            ModuleInstance.registerExtension(ModuleInstanceExtension);
        }
    });

    return ModuleInstanceExtension;
}();

// Source file: Extension/SettingsManagerExtension.js

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

// Source file: Parameter.js

/**
 * @class
 * @constructor
 * @description
 *
 * Instance of current class holds information about parameter:
 * its name and value.
 *
 * @param {string} parameterName
 *      The name of the creating parameter
 *
 * @param {*} parameterValue
 *      The value of the creating parameter
 */
Subclass.Parameter.Parameter = (function()
{
    /**
     * @alias Subclass.Parameter.Parameter
     */
    function Parameter(parameterName, parameterValue)
    {
        /**
         * Parameter name
         *
         * @type {string}
         * @private
         */
        this._name = null;

        /**
         * Parameter value
         *
         * @type {*}
         * @private
         */
        this._value = parameterValue;


        // Initializing operations

        this.setName(parameterName);
    }

    /**
     * Sets name of parameter.
     *
     * It is actual only at init stage. If you want to rename parameter use
     * the {@link Subclass.Parameter.ParameterManager#rename} method
     *
     * @throws {Error}
     *      Throws error if specified invalid name of parameter
     *
     * @param {string} name
     *      The name of parameter
     */
    Parameter.prototype.setName = function(name)
    {
        if (!name || typeof name != 'string') {
            Subclass.Error.create('InvalidArgument')
                .argument("the name of parameter", false)
                .received(name)
                .expected('a string')
                .apply()
            ;
        }
        this._name = name;
    };

    /**
     * Returns parameter name
     *
     * @method getName
     * @memberOf Subclass.Parameter.Parameter.prototype
     *
     * @returns {string}
     */
    Parameter.prototype.getName = function()
    {
        return this._name;
    };

    /**
     * Returns parameter value
     *
     * @method getValue
     * @memberOf Subclass.Parameter.Parameter.prototype
     *
     * @returns {*}
     */
    Parameter.prototype.getValue = function()
    {
        return this._value;
    };

    /**
     * Sets parameter value
     *
     * @method setValue
     * @memberOf Subclass.Parameter.Parameter.prototype
     *
     * @param {*} value
     *      The new parameter value
     */
    Parameter.prototype.setValue = function(value)
    {
        this._value = value;
    };

    return Parameter;

})();

// Source file: ParameterContainer.js

/**
 * @class
 * @constructor
 */
Subclass.Parameter.ParameterContainer = function()
{
    function ParameterContainer(moduleInstance)
    {
        if (!moduleInstance || !(moduleInstance instanceof Subclass.ModuleInstance)) {
            Subclass.Error.create('InvalidArgument')
                .argument('the module instance', false)
                .expected('an instance of class "Subclass.ModuleInstance"')
                .received(moduleInstance)
                .apply()
            ;
        }

        /**
         * Module instance
         *
         * @type {Subclass.ModuleInstance}
         */
        this._moduleInstance = moduleInstance;

        /**
         * Module definition instance
         *
         * @type {Subclass.Module}
         */
        this._module = moduleInstance.getModule();
    }

    ParameterContainer.prototype = {

        /**
         * Returns module definition instance
         *
         * @returns {Subclass.Module}
         */
        getModule: function()
        {
            return this._module;
        },

        /**
         * Returns module instance
         *
         * @returns {Subclass.ModuleInstance}
         */
        getModuleInstance: function()
        {
            return this._moduleInstance;
        },

        /**
         * Returns instance of parameter manager
         *
         * @returns {*|Subclass.Parameter.ParameterManager}
         */
        getParameterManager: function()
        {
            return this.getModule().getParameterManager();
        },

        /**
         * Returns all parameters
         *
         * @returns {Object}
         */
        getParameters: function()
        {
            return this.getParameterManager().getParameters();
        },

        /**
         * Returns value of parameter with specified name
         *
         * @param {string} paramName
         * @returns {*}
         */
        get: function(paramName)
        {
            return this.getParameterManager().get(paramName);
        },

        /**
         * Checks whether parameter with specified name exists
         *
         * @param {string} paramName
         * @returns {boolean}
         */
        isset: function(paramName)
        {
            return this.getParameterManager().isset(paramName);
        }
    };

    return ParameterContainer;
}();

// Source file: Parser/ParameterParser.js

/**
 * @class
 * @constructor
 */
Subclass.Parser.ParameterParser = function()
{
    function ParameterParser()
    {
        ParameterParser.$parent.apply(this, arguments);
    }

    ParameterParser.$parent = Subclass.Parser.ParserAbstract;

    /**
     * @inheritDoc
     */
    ParameterParser.getName = function()
    {
        return "parameter";
    };

    ParameterParser.prototype = {

        /**
         * @inheritDoc
         */
        parse: function(string)
        {
            if (typeof string == 'string' && string.match(/%.+%/i)) {
                var parameterManager = this.getModule().getParameterManager();
                var regExpStr = "%([^%]+)%";
                var regExp = new RegExp(regExpStr, "i");

                if (!(new RegExp("^" + regExpStr + "$", "i")).test(string)) {
                    while (regExp.test(string)) {
                        var parameterName = string.match(regExp)[1];
                        var parameterValue = parameterManager.get(parameterName);

                        string = string.replace(regExp, parameterValue);
                    }
                } else {
                    parameterName = string.match(regExp)[1];
                    string = parameterManager.get(parameterName);
                }
            }
            return string;
        }
    };

    // Registering Parser

    Subclass.Parser.ParserManager.registerParser(ParameterParser);

    return ParameterParser;
}();

// Source file: Subclass.js

/**
 * Registers the new SubclassJS plug-in
 */
Subclass.registerPlugin(function() {

    function ParameterPlugin()
    {
        ParameterPlugin.$parent.call(this);
    }

    ParameterPlugin.$parent = Subclass.SubclassPlugin;

    /**
     * @inheritDoc
     */
    ParameterPlugin.getName = function()
    {
        return "SubclassParameter";
    };

    /**
     * @inheritDoc
     */
    ParameterPlugin.getDependencies = function()
    {
        return ['SubclassParser'];
    };

    return ParameterPlugin;
}());
})();