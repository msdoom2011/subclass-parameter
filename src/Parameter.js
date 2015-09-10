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