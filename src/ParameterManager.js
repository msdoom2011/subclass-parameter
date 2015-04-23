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
     * @method getParameterLocations
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @param {string} parameterName
     *      The name of interesting parameter
     *
     * @returns {string[]}
     */
    ParameterManager.prototype.getParameterLocations = function(parameterName)
    {
        var mainModule = this.getModule().getRoot();
        var locations = [];

        if (arguments[1]) {
            mainModule = arguments[1];
        }
        var moduleStorage = mainModule.getModuleStorage();

        moduleStorage.eachModule(function(module) {
            var parameterManager = module.getParameterManager();

            if (parameterManager.issetParameter(parameterName, true)) {
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
                    var subPluginLocations = subPluginManager.getParameterLocations(parameterName, subPlugin);

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
     * @method registerParameter
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
    ParameterManager.prototype.registerParameter = function(paramName, paramValue)
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
     * @method renameParameter
     * @memberOf Subclass.Parameter.ParameterManager.prototype
     *
     * @param {string} nameOld
     *      The old parameter name
     *
     * @param {string} nameNew
     *      The new parameter name
     */
    ParameterManager.prototype.renameParameter = function(nameOld, nameNew)
    {
        if (!this.issetParameter(nameOld)) {
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
        var moduleNames = this.getParameterLocations(nameOld);

        for (var i = 0; i < moduleNames.length; i++) {
            var module = Subclass.getModule(moduleNames[i]);
            var parameterManager = module.getParameterManager();
            var parameters = parameterManager.getParameters(true);
            var parameter = parameters[nameOld];

            if (!parameter) {
                Subclass.Error.create(
                    'The work of method ' +
                    '"Subclass.Parameter.ParameterManager#getParameterLocations" is incorrect.'
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
     * @method setParameter
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
    ParameterManager.prototype.setParameter = function(paramName, paramValue)
    {
        if (this.getModule().isReady()) {
            Subclass.Error.create('Can\'t change parameter value when module is ready.');
        }
        if (!this.issetParameter(paramName)) {
            Subclass.Error.create('Parameter with name "' + paramName + '" not exists.');
        }
        this._parameters[paramName].setValue(paramValue);
    };

    /**
     * Returns parameter value
     *
     * @method getParameter
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
    ParameterManager.prototype.getParameter = function(paramName)
    {
        if (!this.issetParameter(paramName)) {
            Subclass.Error.create('Parameter with name "' + paramName + '" not exists.');
        }
        return this.getParameters()[paramName].getValue();
    };

    /**
     * Checks whether parameter with passed name is exists
     *
     * @method issetParameter
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
    ParameterManager.prototype.issetParameter = function(paramName, privateParameters)
    {
        return !!this.getParameters(privateParameters)[paramName];
    };

    return ParameterManager;

})();