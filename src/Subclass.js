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