/**
 * @class
 * @constructor
 *
 * Module configs:
 *
 * parameters   {Object}    opt     Object with parameters which can
 *                                  be used by all over module.
 *
 *                                  It is useful for defining some
 *                                  configuration parameters of
 *                                  application, i.e. debug mode.
 *
 *                                  Example:
 *
 *                                  var moduleConfigs = {
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

        eventManager.getEvent('onInitializeBefore').addListener(function(evt, module)
        {
            /**
             * Parameter manager instance
             *
             * @type {Subclass.Parameter.ParameterManager}
             * @private
             */
            this._parameterManager = new Subclass.Parameter.ParameterManager(this);
        });

        eventManager.getEvent('onInitializeAfter').addListener(function(evt, module)
        {
            this.getPropertyManager().initialize();
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

    Subclass.Module.onInitialize(function(evt, module)
    {
        Module = Subclass.Tools.buildClassConstructor(Module);

        if (!Module.hasExtension(ModuleExtension)) {
            Module.registerExtension(ModuleExtension);
        }
    });

    return ModuleExtension;
}();