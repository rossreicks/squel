/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
import { Squel } from './cls';
import { ValueHandler } from './types/value-handler';
import { Cloneable } from './cloneable';
import { isSquelBuilder, _extend, _isArray, _shouldApplyNesting, registerValueHandler } from './helpers';
import { Options } from './types/options';

function getValueHandler(
    value: string | Function,
    localHandlers: ValueHandler<any>[],
    globalHandlers: ValueHandler<any>[]
) {
    return _getValueHandler(value, localHandlers) || _getValueHandler(value, globalHandlers);
}

function _getValueHandler(value: string | Function, handlers: ValueHandler<any>[]) {
    for (let i = 0; i < handlers.length; i++) {
        const typeHandler = handlers[i];
        // if type is a string then use `typeof` or else use `instanceof`

        if (
            // eslint-disable-next-line valid-typeof
            typeof value === typeHandler.type ||
            (typeof typeHandler.type !== 'string' && value instanceof typeHandler.type)
        ) {
            return typeHandler.handler;
        }
    }
}

export const DefaultQueryBuilderOptions = {
    // If true then table names will be rendered inside quotes. The quote character used is configurable via the nameQuoteCharacter option.
    autoQuoteTableNames: false,
    // If true then field names will rendered inside quotes. The quote character used is configurable via the nameQuoteCharacter option.
    autoQuoteFieldNames: false,
    // If true then alias names will rendered inside quotes. The quote character used is configurable via the `tableAliasQuoteCharacter` and `fieldAliasQuoteCharacter` options.
    autoQuoteAliasNames: true,
    // If true then table alias names will rendered after AS keyword.
    useAsForTableAliasNames: false,
    // The quote character used for when quoting table and field names
    nameQuoteCharacter: '`',
    // The quote character used for when quoting table alias names
    tableAliasQuoteCharacter: '`',
    // The quote character used for when quoting table alias names
    fieldAliasQuoteCharacter: '"',
    // Custom value handlers where key is the value type and the value is the handler function
    valueHandlers: [],
    // Character used to represent a parameter value
    parameterCharacter: '?',
    // Numbered parameters returned from toParam() as $1, $2, etc.
    numberedParameters: false,
    // Numbered parameters prefix character(s)
    numberedParametersPrefix: '$',
    // Numbered parameters start at this number.
    numberedParametersStartAt: 1,
    // If false, don't automatically escape single quotes to double quotes. If this is set to false, it opens the developer up for a potential sql injection issue. To combat this, this is now on by default. The replacement string used is configurable via the `singleQuoteReplacement` option.
    replaceSingleQuotes: true,
    // The string to replace single quotes with in query strings
    singleQuoteReplacement: "''",
    // String used to join individual blocks in a query when it's stringified
    separator: ' ',
    // Function for formatting string values prior to insertion into query string
    stringFormatter: null,
    // Whether to prevent the addition of brackets () when nesting this query builder's output
    rawNesting: false,
};

export abstract class BaseBuilder extends Cloneable {
    options: Options;

    constructor(options?: Options) {
        super();

        const defaults = JSON.parse(JSON.stringify(DefaultQueryBuilderOptions));
        // for function values, etc we need to manually copy

        ['stringFormatter'].forEach((p) => {
            defaults[p] = DefaultQueryBuilderOptions[p];
        });

        this.options = _extend({}, defaults, options);
    }

    /**
     * Register a custom value handler for this builder instance.
     *
     * Note: this will override any globally registered handler for this value type.
     */
    registerValueHandler(type, handler) {
        registerValueHandler(this.options.valueHandlers, type, handler);

        return this;
    }

    /**
     * Sanitize given expression.
     */
    _sanitizeExpression(expr: string | BaseBuilder) {
        // If it's not a base builder instance
        if (!isSquelBuilder(expr)) {
            // It must then be a string
            if (typeof expr !== 'string') {
                throw new Error('expression must be a string or builder instance');
            }
        }

        return expr;
    }

    /**
     * Sanitize the given name.
     *
     * The 'type' parameter is used to construct a meaningful error message in case validation fails.
     */
    _sanitizeName(value: string, type: string) {
        if (typeof value !== 'string') {
            throw new Error(`${type} must be a string`);
        }

        return value;
    }

    _sanitizeField<T extends string | BaseBuilder>(item: T): T {
        if (!isSquelBuilder(item)) {
            return this._sanitizeName(item as string, 'field name') as T;
        }

        return item;
    }

    _sanitizeBaseBuilder(item: BaseBuilder) {
        if (isSquelBuilder(item)) {
            return item;
        }

        throw new Error('must be a builder instance');
    }

    _sanitizeTable(item: string | BaseBuilder) {
        if (typeof item !== 'string') {
            try {
                item = this._sanitizeBaseBuilder(item);
            } catch (e) {
                throw new Error('table name must be a string or a builder');
            }
        } else {
            item = this._sanitizeName(item, 'table');
        }

        return item;
    }

    _sanitizeTableAlias(item: string) {
        return this._sanitizeName(item, 'table alias');
    }

    _sanitizeFieldAlias(item: string) {
        return this._sanitizeName(item, 'field alias');
    }

    // Sanitize the given limit/offset value.
    _sanitizeLimitOffset(value: string | number): number {
        value = parseInt(value as string);

        if (value < 0 || Number.isNaN(value)) {
            throw new Error('limit/offset must be >= 0');
        }

        return value;
    }

    // Santize the given field value
    _sanitizeValue(item: any) {
        const itemType = typeof item;

        if (item === null) {
            // null is allowed
        } else if (itemType === 'string' || itemType === 'number' || itemType === 'boolean') {
            // primitives are allowed
        } else if (isSquelBuilder(item)) {
            // Builders allowed
        } else {
            const typeIsValid = !!getValueHandler(item, this.options.valueHandlers, Squel.globalValueHandlers);

            if (!typeIsValid) {
                throw new Error(
                    'field value must be a string, number, boolean, null or one of the registered custom value types'
                );
            }
        }

        return item;
    }

    // Escape a string value, e.g. escape quotes and other characters within it.
    _escapeValue(value: string) {
        return this.options.replaceSingleQuotes && value
            ? value.replace(/'/g, this.options.singleQuoteReplacement)
            : value;
    }

    _formatTableName(item: string) {
        if (this.options.autoQuoteTableNames) {
            const quoteChar = this.options.nameQuoteCharacter;

            item = `${quoteChar}${item}${quoteChar}`;
        }

        return item;
    }

    _formatFieldAlias(item: string) {
        if (this.options.autoQuoteAliasNames) {
            const quoteChar = this.options.fieldAliasQuoteCharacter;

            item = `${quoteChar}${item}${quoteChar}`;
        }

        return item;
    }

    _formatTableAlias(item: string) {
        if (this.options.autoQuoteAliasNames) {
            const quoteChar = this.options.tableAliasQuoteCharacter;

            item = `${quoteChar}${item}${quoteChar}`;
        }

        return this.options.useAsForTableAliasNames ? `AS ${item}` : item;
    }

    _formatFieldName(item: string | BaseBuilder, formattingOptions: Options = {}) {
        if (this.options.autoQuoteFieldNames) {
            const quoteChar = this.options.nameQuoteCharacter;

            if (formattingOptions.ignorePeriodsForFieldNameQuotes) {
                // a.b.c -> `a.b.c`
                item = `${quoteChar}${item}${quoteChar}`;
            } else {
                // a.b.c -> `a`.`b`.`c`
                item = item
                    .toString()
                    .split('.')
                    .map((v) =>
                        // treat '*' as special case (#79)
                        v === '*' ? v : `${quoteChar}${v}${quoteChar}`
                    )
                    .join('.');
            }
        }

        return item;
    }

    // Format the given custom value
    // TODO: figure out this type
    _formatCustomValue(value: any, asParam: boolean, formattingOptions = {}) {
        // user defined custom handlers takes precedence
        const customHandler = getValueHandler(value, this.options.valueHandlers, Squel.globalValueHandlers);

        // use the custom handler if available
        if (customHandler) {
            value = customHandler(value, asParam, formattingOptions);

            // custom value handler can instruct caller not to process returned value
            if (value && value.rawNesting) {
                return {
                    formatted: true,
                    rawNesting: true,
                    value: value.value,
                };
            }
        }

        return {
            formatted: !!customHandler,
            value,
        };
    }

    /**
     * Format given value for inclusion into parameter values array.
     */
    _formatValueForParamArray(value: any, formattingOptions = {}) {
        if (_isArray(value)) {
            return value.map((v) => this._formatValueForParamArray(v, formattingOptions));
        }

        return this._formatCustomValue(value, true, formattingOptions).value;
    }

    /**
     * Format the given field value for inclusion into the query string
     */
    _formatValueForQueryString(initialValue: any, formattingOptions: Options = {}) {
        // maybe we have a cusotm value handler
        // eslint-disable-next-line prefer-const
        let { rawNesting, formatted, value } = this._formatCustomValue(initialValue, false, formattingOptions);

        // if formatting took place then return it directly
        if (formatted) {
            if (rawNesting) {
                return value;
            }

            return this._applyNestingFormatting(value, _shouldApplyNesting(initialValue));
        }

        // if it's an array then format each element separately
        if (_isArray(value)) {
            value = value.map((v) => this._formatValueForQueryString(v));

            value = this._applyNestingFormatting(value.join(', '), _shouldApplyNesting(value));
        } else {
            const typeofValue = typeof value;

            if (value === null) {
                value = 'NULL';
            } else if (typeofValue === 'boolean') {
                value = value ? 'TRUE' : 'FALSE';
            } else if (isSquelBuilder(value)) {
                value = this._applyNestingFormatting(value.toString(), _shouldApplyNesting(value));
            } else if (typeofValue !== 'number') {
                // if it's a string and we have custom string formatting turned on then use that
                if (typeofValue === 'string' && this.options.stringFormatter) {
                    return this.options.stringFormatter(value);
                }

                if (formattingOptions.dontQuote) {
                    value = `${value}`;
                } else {
                    const escapedValue = this._escapeValue(value);

                    value = `'${escapedValue}'`;
                }
            }
        }

        return value;
    }

    _applyNestingFormatting(str, nesting = true) {
        if (str && typeof str === 'string' && nesting && !this.options.rawNesting) {
            // apply brackets if they're not already existing
            let alreadyHasBrackets = str.charAt(0) === '(' && str.charAt(str.length - 1) === ')';

            if (alreadyHasBrackets) {
                // check that it's the form "((x)..(y))" rather than "(x)..(y)"
                let idx = 0;

                let open = 1;

                while (str.length - 1 > ++idx) {
                    const c = str.charAt(idx);

                    if (c === '(') {
                        open++;
                    } else if (c === ')') {
                        open--;
                        if (open < 1) {
                            alreadyHasBrackets = false;

                            break;
                        }
                    }
                }
            }

            if (!alreadyHasBrackets) {
                str = `(${str})`;
            }
        }

        return str;
    }

    /**
     * Build given string and its corresponding parameter values into
     * output.
     *
     * @param {String} str
     * @param {Array}  values
     * @param {Object} [options] Additional options.
     * @param {Boolean} [options.buildParameterized] Whether to build paramterized string. Default is false.
     * @param {Boolean} [options.nested] Whether this expression is nested within another.
     * @param {Boolean} [options.formattingOptions] Formatting options for values in query string.
     * @return {Object}
     */
    _buildString(
        str: string,
        values: any[],
        options: {
            buildParameterized?: boolean;
            nested?: boolean;
            formattingOptions?: any;
        } = {}
    ) {
        const { nested, buildParameterized, formattingOptions } = options;

        values = values || [];
        str = str || '';

        let formattedStr = '';

        let curValue = -1;
        const formattedValues = [];

        const paramChar = this.options.parameterCharacter;

        let idx = 0;

        while (str.length > idx) {
            // param char?
            if (str.substr(idx, paramChar.length) === paramChar) {
                let value = values[++curValue];

                if (buildParameterized) {
                    if (isSquelBuilder(value)) {
                        const ret = value._toParamString({
                            buildParameterized,
                            nested: true,
                        });

                        formattedStr += ret.text;
                        ret.values.forEach((v) => formattedValues.push(v));
                    } else {
                        value = this._formatValueForParamArray(value, formattingOptions);

                        if (_isArray(value)) {
                            // Array(6) -> "(??, ??, ??, ??, ??, ??)"
                            const tmpStr = value.map(() => paramChar).join(', ');

                            formattedStr += `(${tmpStr})`;

                            value.forEach((val) => formattedValues.push(val));
                        } else {
                            formattedStr += paramChar;

                            formattedValues.push(value);
                        }
                    }
                } else {
                    formattedStr += this._formatValueForQueryString(value, formattingOptions);
                }

                idx += paramChar.length;
            } else {
                formattedStr += str.charAt(idx);

                idx++;
            }
        }

        return {
            text: this._applyNestingFormatting(formattedStr, !!nested),
            values: formattedValues,
        };
    }

    /**
     * Build all given strings and their corresponding parameter values into
     * output.
     *
     * @param {Array} strings
     * @param {Array}  strValues array of value arrays corresponding to each string.
     * @param {Object} [options] Additional options.
     * @param {Boolean} [options.buildParameterized] Whether to build paramterized string. Default is false.
     * @param {Boolean} [options.nested] Whether this expression is nested within another.
     * @return {Object}
     */
    _buildManyStrings(strings: string[], strValues: string[][], options: Options = {}) {
        const totalStr: string[] = [];
        const totalValues = [];

        for (let idx = 0; strings.length > idx; ++idx) {
            const inputString = strings[idx];
            const inputValues = strValues[idx];

            const { text, values } = this._buildString(inputString, inputValues, {
                buildParameterized: options.buildParameterized,
                nested: false,
            });

            totalStr.push(text);
            values.forEach((value) => totalValues.push(value));
        }

        const totalStrJoined = totalStr.join(this.options.separator);

        return {
            text: totalStrJoined.length ? this._applyNestingFormatting(totalStrJoined, !!options.nested) : '',
            values: totalValues,
        };
    }

    /**
     * Get parameterized representation of this instance.
     *
     * @param {Object} [options] Options.
     * @param {Boolean} [options.buildParameterized] Whether to build paramterized string. Default is false.
     * @param {Boolean} [options.nested] Whether this expression is nested within another.
     * @return {Object}
     */
    abstract _toParamString(options: Options): { text: string; values: any[] };

    /**
     * Get the expression string.
     * @return {String}
     */
    toString(options: Options = {}) {
        return this._toParamString(options).text;
    }

    /**
     * Get the parameterized expression string.
     * @return {Object}
     */
    toParam(options: Options = {}) {
        return this._toParamString(
            _extend({}, options, {
                buildParameterized: true,
            })
        );
    }
}
