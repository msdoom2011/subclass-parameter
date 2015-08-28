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
                        var parameterValue = parameterManager.getParameter(parameterName);

                        string = string.replace(regExp, parameterValue);
                    }
                } else {
                    parameterName = string.match(regExp)[1];
                    string = parameterManager.getParameter(parameterName);
                }
            }
            return string;
        }
    };

    // Registering Parser

    Subclass.Parser.ParserManager.registerParser(ParameterParser);

    return ParameterParser;
}();