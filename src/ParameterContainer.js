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