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