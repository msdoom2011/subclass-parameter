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
                var regex = /%([^%]+)%/i;

                while (regex.test(string)) {
                    var parameterName = this.getParserManager().parse(string.match(regex)[1]);
                    var parameterValue = parameterManager.getParameter(parameterName);

                    string = string.replace(regex, parameterValue);
                }
            }
            return string;
        }
    };

    // Registering Parser

    Subclass.Parser.ParserManager.registerParser(ParameterParser);

    return ParameterParser;
}();