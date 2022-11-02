/* Version: 1.0.0 - November 2, 2022 08:45:43 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// get whether object is a plain object
function _isPlainObject(obj) {
    return obj && obj.constructor.prototype === Object.prototype;
}
// get whether object is an array
function _isArray(obj) {
    return obj && obj.constructor.prototype === Array.prototype;
}
function _extend(dst, ...sources) {
    if (dst && sources) {
        for (const src of sources) {
            if (typeof src === 'object') {
                Object.getOwnPropertyNames(src).forEach((key) => {
                    dst[key] = src[key];
                });
            }
        }
    }
    return dst;
}
function _clone(src) {
    if (!src) {
        return src;
    }
    if (typeof src.clone === 'function') {
        return src.clone();
    }
    if (_isPlainObject(src) || _isArray(src)) {
        const ret = new src.constructor();
        Object.getOwnPropertyNames(src).forEach((key) => {
            if (typeof src[key] !== 'function') {
                ret[key] = _clone(src[key]);
            }
        });
        return ret;
    }
    return JSON.parse(JSON.stringify(src));
}
function isSquelBuilder(obj) {
    return obj && !!obj._toParamString;
}
const _shouldApplyNesting = function (obj) {
    return !isSquelBuilder(obj) || !obj.options.rawNesting;
};
// append to string if non-empty
function _pad(str, pad) {
    return str.length ? str + pad : str;
}
function registerValueHandler(handlers, type, handler) {
    const typeofType = typeof type;
    if (typeofType !== 'function' && typeofType !== 'string') {
        throw new Error('type must be a class constructor or string');
    }
    if (typeof handler !== 'function') {
        throw new Error('handler must be a function');
    }
    for (const typeHandler of handlers) {
        if (typeHandler.type === type) {
            typeHandler.handler = handler;
            return;
        }
    }
    handlers.push({
        type,
        handler,
    });
}

class Cloneable {
    /**
     * Clone this builder
     */
    clone() {
        const newInstance = new this.constructor();
        return _extend(newInstance, _clone(_extend({}, this)));
    }
}

/* eslint-disable @typescript-eslint/ban-types */
function getValueHandler(value, localHandlers, globalHandlers) {
    return _getValueHandler(value, localHandlers) || _getValueHandler(value, globalHandlers);
}
function _getValueHandler(value, handlers) {
    for (let i = 0; i < handlers.length; i++) {
        const typeHandler = handlers[i];
        // if type is a string then use `typeof` or else use `instanceof`
        if (
        // eslint-disable-next-line valid-typeof
        typeof value === typeHandler.type ||
            (typeof typeHandler.type !== 'string' && value instanceof typeHandler.type)) {
            return typeHandler.handler;
        }
    }
}
const DefaultQueryBuilderOptions = {
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
    // If true then replaces all single quotes within strings. The replacement string used is configurable via the `singleQuoteReplacement` option.
    replaceSingleQuotes: false,
    // The string to replace single quotes with in query strings
    singleQuoteReplacement: "''",
    // String used to join individual blocks in a query when it's stringified
    separator: ' ',
    // Function for formatting string values prior to insertion into query string
    stringFormatter: null,
    // Whether to prevent the addition of brackets () when nesting this query builder's output
    rawNesting: false,
};
class BaseBuilder extends Cloneable {
    /**
     * Constructor.
     * this.param  {Object} options Overriding one or more of `cls.DefaultQueryBuilderOptions`.
     */
    constructor(options) {
        super();
        // TODO this needs to be shared from the parent somehow
        this.globalValueHandlers = [];
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
    _sanitizeExpression(expr) {
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
    _sanitizeName(value, type) {
        if (typeof value !== 'string') {
            throw new Error(`${type} must be a string`);
        }
        return value;
    }
    _sanitizeField(item) {
        if (!isSquelBuilder(item)) {
            return this._sanitizeName(item, 'field name');
        }
        return item;
    }
    _sanitizeBaseBuilder(item) {
        if (isSquelBuilder(item)) {
            return item;
        }
        throw new Error('must be a builder instance');
    }
    _sanitizeTable(item) {
        if (typeof item !== 'string') {
            try {
                item = this._sanitizeBaseBuilder(item);
            }
            catch (e) {
                throw new Error('table name must be a string or a builder');
            }
        }
        else {
            item = this._sanitizeName(item, 'table');
        }
        return item;
    }
    _sanitizeTableAlias(item) {
        return this._sanitizeName(item, 'table alias');
    }
    _sanitizeFieldAlias(item) {
        return this._sanitizeName(item, 'field alias');
    }
    // Sanitize the given limit/offset value.
    _sanitizeLimitOffset(value) {
        value = parseInt(value);
        if (value < 0 || Number.isNaN(value)) {
            throw new Error('limit/offset must be >= 0');
        }
        return value;
    }
    // Santize the given field value
    _sanitizeValue(item) {
        const itemType = typeof item;
        if (item === null) ;
        else if (itemType === 'string' || itemType === 'number' || itemType === 'boolean') ;
        else if (isSquelBuilder(item)) ;
        else {
            const typeIsValid = !!getValueHandler(item, this.options.valueHandlers, this.globalValueHandlers);
            if (!typeIsValid) {
                throw new Error('field value must be a string, number, boolean, null or one of the registered custom value types');
            }
        }
        return item;
    }
    // Escape a string value, e.g. escape quotes and other characters within it.
    _escapeValue(value) {
        return this.options.replaceSingleQuotes && value
            ? value.replace(/'/g, this.options.singleQuoteReplacement)
            : value;
    }
    _formatTableName(item) {
        if (this.options.autoQuoteTableNames) {
            const quoteChar = this.options.nameQuoteCharacter;
            item = `${quoteChar}${item}${quoteChar}`;
        }
        return item;
    }
    _formatFieldAlias(item) {
        if (this.options.autoQuoteAliasNames) {
            const quoteChar = this.options.fieldAliasQuoteCharacter;
            item = `${quoteChar}${item}${quoteChar}`;
        }
        return item;
    }
    _formatTableAlias(item) {
        if (this.options.autoQuoteAliasNames) {
            const quoteChar = this.options.tableAliasQuoteCharacter;
            item = `${quoteChar}${item}${quoteChar}`;
        }
        return this.options.useAsForTableAliasNames ? `AS ${item}` : item;
    }
    _formatFieldName(item, formattingOptions = {}) {
        if (this.options.autoQuoteFieldNames) {
            const quoteChar = this.options.nameQuoteCharacter;
            if (formattingOptions.ignorePeriodsForFieldNameQuotes) {
                // a.b.c -> `a.b.c`
                item = `${quoteChar}${item}${quoteChar}`;
            }
            else {
                // a.b.c -> `a`.`b`.`c`
                item = item
                    .toString()
                    .split('.')
                    .map((v) => 
                // treat '*' as special case (#79)
                v === '*' ? v : `${quoteChar}${v}${quoteChar}`)
                    .join('.');
            }
        }
        return item;
    }
    // Format the given custom value
    // TODO: figure out this type
    _formatCustomValue(value, asParam, formattingOptions = {}) {
        // user defined custom handlers takes precedence
        const customHandler = getValueHandler(value, this.options.valueHandlers, this.globalValueHandlers);
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
    _formatValueForParamArray(value, formattingOptions = {}) {
        if (_isArray(value)) {
            return value.map((v) => this._formatValueForParamArray(v, formattingOptions));
        }
        return this._formatCustomValue(value, true, formattingOptions).value;
    }
    /**
     * Format the given field value for inclusion into the query string
     */
    _formatValueForQueryString(initialValue, formattingOptions = {}) {
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
        }
        else {
            const typeofValue = typeof value;
            if (value === null) {
                value = 'NULL';
            }
            else if (typeofValue === 'boolean') {
                value = value ? 'TRUE' : 'FALSE';
            }
            else if (isSquelBuilder(value)) {
                value = this._applyNestingFormatting(value.toString(), _shouldApplyNesting(value));
            }
            else if (typeofValue !== 'number') {
                // if it's a string and we have custom string formatting turned on then use that
                if (typeofValue === 'string' && this.options.stringFormatter) {
                    return this.options.stringFormatter(value);
                }
                if (formattingOptions.dontQuote) {
                    value = `${value}`;
                }
                else {
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
                    }
                    else if (c === ')') {
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
    _buildString(str, values, options = {}) {
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
                    }
                    else {
                        value = this._formatValueForParamArray(value, formattingOptions);
                        if (_isArray(value)) {
                            // Array(6) -> "(??, ??, ??, ??, ??, ??)"
                            const tmpStr = value.map(() => paramChar).join(', ');
                            formattedStr += `(${tmpStr})`;
                            value.forEach((val) => formattedValues.push(val));
                        }
                        else {
                            formattedStr += paramChar;
                            formattedValues.push(value);
                        }
                    }
                }
                else {
                    formattedStr += this._formatValueForQueryString(value, formattingOptions);
                }
                idx += paramChar.length;
            }
            else {
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
    _buildManyStrings(strings, strValues, options = {}) {
        const totalStr = [];
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
     * Get the expression string.
     * @return {String}
     */
    toString(options = {}) {
        return this._toParamString(options).text;
    }
    /**
     * Get the parameterized expression string.
     * @return {Object}
     */
    toParam(options = {}) {
        return this._toParamString(_extend({}, options, {
            buildParameterized: true,
        }));
    }
}

/**
 * An SQL expression builder.
 *
 * SQL expressions are used in WHERE and ON clauses to filter data by various criteria.
 *
 * Expressions can be nested. Nested expression contains can themselves
 * contain nested expressions. When rendered a nested expression will be
 * fully contained within brackets.
 *
 * All the build methods in this object return the object instance for chained method calling purposes.
 */
class Expression extends BaseBuilder {
    // Initialize the expression.
    constructor(options) {
        super(options);
        this._nodes = [];
    }
    // Combine the current expression with the given expression using the intersection operator (AND).
    and(expr, ...params) {
        expr = this._sanitizeExpression(expr);
        this._nodes.push({
            type: 'AND',
            expr,
            para: params,
        });
        return this;
    }
    // Combine the current expression with the given expression using the union operator (OR).
    or(expr, ...params) {
        expr = this._sanitizeExpression(expr);
        this._nodes.push({
            type: 'OR',
            expr,
            para: params,
        });
        return this;
    }
    _toParamString(options = {}) {
        const totalStr = [];
        const totalValues = [];
        for (const node of this._nodes) {
            const { type, expr, para } = node;
            const { text, values } = isSquelBuilder(expr)
                ? expr._toParamString({
                    buildParameterized: options.buildParameterized,
                    nested: true,
                })
                : this._buildString(expr, para, {
                    buildParameterized: options.buildParameterized,
                });
            if (totalStr.length) {
                totalStr.push(type);
            }
            totalStr.push(text);
            values.forEach((value) => totalValues.push(value));
        }
        const joinString = totalStr.join(' ');
        return {
            text: this._applyNestingFormatting(joinString, !!options.nested),
            values: totalValues,
        };
    }
}

/**
 * An SQL CASE expression builder.
 *
 * SQL cases are used to select proper values based on specific criteria.
 */
class Case extends BaseBuilder {
    constructor(fieldName, options = {}) {
        super(options);
        if (_isPlainObject(fieldName)) {
            options = fieldName;
            fieldName = null;
        }
        if (fieldName) {
            this._fieldName = this._sanitizeField(fieldName);
        }
        this.options = _extend({}, DefaultQueryBuilderOptions, options);
        this._cases = [];
        this._elseValue = null;
    }
    when(expression, ...values) {
        this._cases.unshift({
            expression,
            values: values || [],
        });
        return this;
    }
    then(result) {
        if (this._cases.length === 0) {
            throw new Error('when() needs to be called first');
        }
        this._cases[0].result = result;
        return this;
    }
    else(elseValue) {
        this._elseValue = elseValue;
        return this;
    }
    _toParamString(options = {}) {
        let totalStr = '';
        const totalValues = [];
        for (const { expression, values, result } of this._cases) {
            totalStr = _pad(totalStr, ' ');
            const ret = this._buildString(expression, values, {
                buildParameterized: options.buildParameterized,
                nested: true,
            });
            totalStr += `WHEN ${ret.text} THEN ${this._formatValueForQueryString(result)}`;
            ret.values.forEach((value) => totalValues.push(value));
        }
        if (totalStr.length) {
            totalStr += ` ELSE ${this._formatValueForQueryString(this._elseValue)} END`;
            if (this._fieldName) {
                totalStr = `${this._fieldName} ${totalStr}`;
            }
            totalStr = `CASE ${totalStr}`;
        }
        else {
            totalStr = this._formatValueForQueryString(this._elseValue);
        }
        return {
            text: totalStr,
            values: totalValues,
        };
    }
}

/**
 * Query builder base class
 *
 * Note that the query builder does not check the final query string for correctness.
 *
 * All the build methods in this object return the object instance for chained method calling purposes.
 */
class QueryBuilder extends BaseBuilder {
    /**
     * Constructor
     *
     * blocks - array of cls.BaseBuilderBlock instances to build the query with.
     */
    constructor(options, blocks) {
        super(options);
        this.blocks = blocks || [];
        // Copy exposed methods into myself
        for (const block of this.blocks) {
            const exposedMethods = block.exposedMethods();
            for (const methodName in exposedMethods) {
                const methodBody = exposedMethods[methodName];
                if (undefined !== this[methodName]) {
                    throw new Error(`Builder already has a builder method called: ${methodName}`);
                }
                ((block, name, body) => {
                    this[name] = (...args) => {
                        body.call(block, ...args);
                        return this;
                    };
                })(block, methodName, methodBody);
            }
        }
    }
    /**
     * Register a custom value handler for this query builder and all its contained blocks.
     *
     * Note: This will override any globally registered handler for this value type.
     */
    registerValueHandler(type, handler) {
        for (const block of this.blocks) {
            block.registerValueHandler(type, handler);
        }
        super.registerValueHandler(type, handler);
        return this;
    }
    /**
     * Update query builder options
     *
     * This will update the options for all blocks too. Use this method with caution as it allows you to change the
     * behaviour of your query builder mid-build.
     */
    updateOptions(options) {
        this.options = _extend({}, this.options, options);
        for (const block of this.blocks) {
            block.options = _extend({}, block.options, options);
        }
    }
    // Get the final fully constructed query param obj.
    _toParamString(options = {}) {
        options = _extend({}, this.options, options);
        const blockResults = this.blocks.map((b) => b._toParamString({
            buildParameterized: options.buildParameterized,
            queryBuilder: this,
        }));
        const blockTexts = blockResults.map((b) => b.text);
        const blockValues = blockResults.map((b) => b.values);
        let totalStr = blockTexts.filter((v) => v.length > 0).join(options.separator);
        const totalValues = [];
        blockValues.forEach((block) => block.forEach((value) => totalValues.push(value)));
        if (!options.nested) {
            if (options.numberedParameters) {
                let i = undefined !== options.numberedParametersStartAt ? options.numberedParametersStartAt : 1;
                // construct regex for searching
                const regex = options.parameterCharacter.replace(/[-[\]{}()*+?.,\\^$|*\s]/g, '\\$&');
                totalStr = totalStr.replace(new RegExp(regex, 'g'), () => `${options.numberedParametersPrefix}${i++}`);
            }
        }
        return {
            text: this._applyNestingFormatting(totalStr, !!options.nested),
            values: totalValues,
        };
    }
    // Deep clone
    clone() {
        const blockClones = this.blocks.map((v) => v.clone());
        return new this.constructor(this.options, blockClones);
    }
    // Get a specific block
    getBlock(blockType) {
        const filtered = this.blocks.filter((b) => b instanceof blockType);
        return filtered[0];
    }
}

/* eslint-disable no-loop-func */
/*
 * ---------------------------------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------------------------------
 * Building blocks
 * ---------------------------------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------------------------------
 */
/*
 * A building block represents a single build-step within a query building process.
 *
 * Query builders consist of one or more building blocks which get run in a particular order. Building blocks can
 * optionally specify methods to expose through the query builder interface. They can access all the input data for
 * the query builder and manipulate it as necessary, as well as append to the final query string output.
 *
 * If you wish to customize how queries get built or add proprietary query phrases and content then it is recommended
 * that you do so using one or more custom building blocks.
 *
 * Original idea posted in https://github.com/hiddentao/export/issues/10*issuecomment-15016427
 */
class Block extends BaseBuilder {
    constructor(options) {
        super(options);
    }
    /**
     * Get input methods to expose within the query builder.
     *
     * By default all methods except the following get returned:
     *   methods prefixed with _
     *   constructor and toString()
     *
     * @return Object key -> function pairs
     */
    exposedMethods() {
        const ret = {};
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let obj = this;
        while (obj) {
            Object.getOwnPropertyNames(obj).forEach((prop) => {
                if (prop !== 'constructor' &&
                    typeof obj[prop] === 'function' &&
                    prop.charAt(0) !== '_' &&
                    !Block.prototype[prop]) {
                    ret[prop] = obj[prop];
                }
            });
            obj = Object.getPrototypeOf(obj);
        }
        return ret;
    }
}

/**
 * A function string block
 */
class FunctionBlock extends Block {
    constructor(options) {
        super(options);
        this._strings = [];
        this._values = [];
    }
    function(str, ...values) {
        this._strings.push(str);
        this._values.push(values);
        return this;
    }
    _toParamString(options = {}) {
        return this._buildManyStrings(this._strings, this._values, options);
    }
}

// A fixed string which always gets output
class StringBlock extends Block {
    constructor(options, str) {
        super(options);
        this._str = str;
    }
    _toParamString(options = {}) {
        return {
            text: this._str,
            values: [],
        };
    }
}

class DistinctBlock extends Block {
    // Add the DISTINCT keyword to the query.
    distinct() {
        this._useDistinct = true;
        return this;
    }
    _toParamString() {
        return {
            text: this._useDistinct ? 'DISTINCT' : '',
            values: [],
        };
    }
}

/* eslint-disable no-param-reassign */
class AbstractTableBlock extends Block {
    /**
     * @param {Boolean} [options.singleTable] If true then only allow one table spec.
     * @param {String} [options.prefix] String prefix for output.
     */
    constructor(options, prefix) {
        super(options);
        this._tables = [];
    }
    /**
     * Update given table.
     *
     * An alias may also be specified for the table.
     *
     * Concrete subclasses should provide a method which calls this
     */
    _table(table, alias = null) {
        alias = alias ? this._sanitizeTableAlias(alias) : alias;
        table = this._sanitizeTable(table);
        if (this.options.singleTable) {
            this._tables = [];
        }
        this._tables.push({
            table,
            alias,
        });
    }
    // get whether a table has been set
    _hasTable() {
        return this._tables.length > 0;
    }
    /**
     * @override
     */
    _toParamString(options = {}) {
        let totalStr = '';
        const totalValues = [];
        if (this._hasTable()) {
            // retrieve the parameterized queries
            for (const { table, alias } of this._tables) {
                totalStr = _pad(totalStr, ', ');
                let tableStr;
                if (isSquelBuilder(table)) {
                    const { text, values } = table._toParamString({
                        buildParameterized: options.buildParameterized,
                        nested: true,
                    });
                    tableStr = text;
                    values.forEach((value) => totalValues.push(value));
                }
                else {
                    tableStr = this._formatTableName(table);
                }
                if (alias) {
                    tableStr += ` ${this._formatTableAlias(alias)}`;
                }
                totalStr += tableStr;
            }
            if (this.options.prefix) {
                totalStr = `${this.options.prefix} ${totalStr}`;
            }
        }
        return {
            text: totalStr,
            values: totalValues,
        };
    }
}

class FromTableBlock extends AbstractTableBlock {
    constructor(options) {
        super(_extend({}, options, {
            prefix: 'FROM',
        }));
    }
    from(table, alias = null) {
        this._table(table, alias);
        return this;
    }
}

class GetFieldBlock extends Block {
    constructor(options) {
        super(options);
        this._fields = [];
    }
    fields(_fields, options = {}) {
        if (_isArray(_fields)) {
            for (const field of _fields) {
                this.field(field, null, options);
            }
        }
        else {
            for (const field in _fields) {
                const alias = _fields[field];
                this.field(field, alias, options);
            }
        }
        return this;
    }
    field(field, alias = null, options = {}) {
        alias = alias ? this._sanitizeFieldAlias(alias) : alias;
        field = this._sanitizeField(field);
        // if field-alias combo already present then don't add
        const existingField = this._fields.filter((f) => f.name === field && f.alias === alias);
        if (existingField.length) {
            return this;
        }
        this._fields.push({
            name: field,
            alias,
            options,
        });
        return this;
    }
    _toParamString(opts = {}) {
        const { queryBuilder, buildParameterized } = opts;
        let totalStr = '';
        const totalValues = [];
        for (const field of this._fields) {
            totalStr = _pad(totalStr, ', ');
            const { name, alias, options } = field;
            if (typeof name === 'string') {
                totalStr += this._formatFieldName(name, options);
            }
            else {
                const ret = name._toParamString({
                    nested: true,
                    buildParameterized,
                });
                totalStr += ret.text;
                ret.values.forEach((value) => totalValues.push(value));
            }
            if (alias) {
                totalStr += ` AS ${this._formatFieldAlias(alias)}`;
            }
        }
        if (!totalStr.length) {
            // if select query and a table is set then all fields wanted
            const fromTableBlock = queryBuilder && queryBuilder.getBlock(FromTableBlock);
            if (fromTableBlock && fromTableBlock instanceof AbstractTableBlock && fromTableBlock._hasTable()) {
                totalStr = '*';
            }
        }
        return {
            text: totalStr,
            values: totalValues,
        };
    }
}

class JoinBlock extends Block {
    constructor(options) {
        super(options);
        this._joins = [];
    }
    join(table, alias = null, condition = null, type = 'INNER') {
        table = this._sanitizeTable(table);
        alias = alias ? this._sanitizeTableAlias(alias) : alias;
        condition = condition ? this._sanitizeExpression(condition) : condition;
        this._joins.push({
            type,
            table,
            alias,
            condition,
        });
        return this;
    }
    left_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'LEFT');
        return this;
    }
    right_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'RIGHT');
        return this;
    }
    outer_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'OUTER');
        return this;
    }
    left_outer_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'LEFT OUTER');
        return this;
    }
    full_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'FULL');
        return this;
    }
    cross_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'CROSS');
        return this;
    }
    _toParamString(options = {}) {
        let totalStr = '';
        const totalValues = [];
        for (const { type, table, alias, condition } of this._joins) {
            totalStr = _pad(totalStr, this.options.separator);
            let tableStr;
            if (isSquelBuilder(table)) {
                const ret = table._toParamString({
                    buildParameterized: options.buildParameterized,
                    nested: true,
                });
                ret.values.forEach((value) => totalValues.push(value));
                tableStr = ret.text;
            }
            else {
                tableStr = this._formatTableName(table);
            }
            totalStr += `${type} JOIN ${tableStr}`;
            if (alias) {
                totalStr += ` ${this._formatTableAlias(alias)}`;
            }
            if (condition) {
                totalStr += ' ON ';
                let ret;
                if (isSquelBuilder(condition)) {
                    ret = condition._toParamString({
                        buildParameterized: options.buildParameterized,
                    });
                }
                else {
                    ret = this._buildString(condition, [], {
                        buildParameterized: options.buildParameterized,
                    });
                }
                totalStr += this._applyNestingFormatting(ret.text);
                ret.values.forEach((value) => totalValues.push(value));
            }
        }
        return {
            text: totalStr,
            values: totalValues,
        };
    }
}

class AbstractConditionBlock extends Block {
    /**
     * @param {String} options.verb The condition verb.
     */
    constructor(options) {
        super(options);
        this._conditions = [];
    }
    /**
     * Add a condition.
     *
     * When the final query is constructed all the conditions are combined using the intersection (AND) operator.
     *
     * Concrete subclasses should provide a method which calls this
     */
    _condition(condition, ...values) {
        condition = this._sanitizeExpression(condition);
        this._conditions.push({
            expr: condition,
            values: values || [],
        });
    }
    _toParamString(options = {}) {
        const totalStr = [];
        const totalValues = [];
        for (const { expr, values } of this._conditions) {
            const ret = isSquelBuilder(expr)
                ? expr._toParamString({
                    buildParameterized: options.buildParameterized,
                })
                : this._buildString(expr, values, {
                    buildParameterized: options.buildParameterized,
                });
            if (ret.text.length) {
                totalStr.push(ret.text);
            }
            ret.values.forEach((value) => totalValues.push(value));
        }
        let joinedString = '';
        if (totalStr.length) {
            joinedString = totalStr.join(') AND (');
        }
        return {
            text: joinedString.length ? `${this.options.verb} (${joinedString})` : '',
            values: totalValues,
        };
    }
}

class WhereBlock extends AbstractConditionBlock {
    constructor(options) {
        super(_extend({}, options, {
            verb: 'WHERE',
        }));
    }
    where(condition, ...values) {
        this._condition(condition, ...values);
        return this;
    }
}

class GroupByBlock extends Block {
    constructor(options) {
        super(options);
        this._groups = [];
    }
    group(field) {
        this._groups.push(this._sanitizeField(field));
        return this;
    }
    _toParamString(options = {}) {
        return {
            text: this._groups.length ? `GROUP BY ${this._groups.join(', ')}` : '',
            values: [],
        };
    }
}

class HavingBlock extends AbstractConditionBlock {
    constructor(options) {
        super(_extend({}, options, {
            verb: 'HAVING',
        }));
    }
    having(condition, ...values) {
        this._condition(condition, ...values);
        return this;
    }
}

class OrderByBlock extends Block {
    constructor(options) {
        super(options);
        this._orders = [];
    }
    /**
     * Add an ORDER BY transformation for the given field in the given order.
     *
     * To specify descending order pass false for the 'dir' parameter.
     */
    order(field, dir, ...values) {
        field = this._sanitizeField(field);
        let direction = null;
        if (!(typeof dir === 'string')) {
            if (dir === undefined) {
                direction = 'ASC'; // Default to asc
            }
            else if (dir !== null) {
                direction = dir ? 'ASC' : 'DESC'; // Convert truthy to asc
            }
        }
        else {
            direction = dir;
        }
        this._orders.push({
            field,
            dir: direction,
            values: values || [],
        });
        return this;
    }
    _toParamString(options = {}) {
        let totalStr = '';
        const totalValues = [];
        for (const { field, dir, values } of this._orders) {
            totalStr = _pad(totalStr, ', ');
            const ret = this._buildString(field.toString(), values, {
                buildParameterized: options.buildParameterized,
            });
            (totalStr += ret.text), _isArray(ret.values) && ret.values.forEach((value) => totalValues.push(value));
            if (dir !== null) {
                totalStr += ` ${dir}`;
            }
        }
        return {
            text: totalStr.length ? `ORDER BY ${totalStr}` : '',
            values: totalValues,
        };
    }
}

class AbstractVerbSingleValueBlock extends Block {
    /**
     * @param options.verb The prefix verb string.
     */
    constructor(options) {
        super(options);
        this._value = null;
    }
    _setValue(value) {
        this._value = value !== null ? this._sanitizeLimitOffset(value) : value;
    }
    _toParamString(options = {}) {
        const expr = this._value !== null ? `${this.options.verb} ${this.options.parameterCharacter}` : '';
        const values = this._value !== null ? [this._value] : [];
        return this._buildString(expr, values, options);
    }
}

class LimitBlock extends AbstractVerbSingleValueBlock {
    constructor(options) {
        super(_extend({}, options, {
            verb: 'LIMIT',
        }));
    }
    limit(limit) {
        this._setValue(limit);
        return this;
    }
}

class OffsetBlock extends AbstractVerbSingleValueBlock {
    constructor(options) {
        super(_extend({}, options, {
            verb: 'OFFSET',
        }));
    }
    offset(start) {
        this._setValue(start);
        return this;
    }
}

class UnionBlock extends Block {
    constructor(options) {
        super(options);
        this._unions = [];
    }
    union(table, type = 'UNION') {
        table = this._sanitizeTable(table);
        this._unions.push({
            type,
            table,
        });
        return this;
    }
    union_all(table) {
        this.union(table, 'UNION ALL');
        return this;
    }
    _toParamString(options = {}) {
        let totalStr = '';
        const totalValues = [];
        for (const { type, table } of this._unions) {
            totalStr = _pad(totalStr, this.options.separator);
            let tableStr;
            if (isSquelBuilder(table)) {
                const ret = table._toParamString({
                    buildParameterized: options.buildParameterized,
                    nested: true,
                });
                tableStr = ret.text;
                ret.values.forEach((value) => totalValues.push(value));
            }
            else {
                totalStr = this._formatTableName(table);
            }
            totalStr += `${type} ${tableStr}`;
        }
        return {
            text: totalStr,
            values: totalValues,
        };
    }
}

class InsertFieldsFromQueryBlock extends Block {
    constructor(options) {
        super(options);
        this._fields = [];
        this._query = null;
    }
    fromQuery(fields, selectQuery) {
        this._fields = fields.map((v) => this._sanitizeField(v));
        this._query = this._sanitizeBaseBuilder(selectQuery);
        return this;
    }
    _toParamString(options = {}) {
        let totalStr = '';
        let totalValues = [];
        if (this._fields.length && this._query) {
            const { text, values } = this._query._toParamString({
                buildParameterized: options.buildParameterized,
                nested: true,
            });
            totalStr = `(${this._fields.join(', ')}) ${this._applyNestingFormatting(text)}`;
            totalValues = values;
        }
        return {
            text: totalStr,
            values: totalValues,
        };
    }
}

/**
 * Base class for setting fields to values (used for INSERT and UPDATE queries)
 */
class AbstractSetFieldBlock extends Block {
    constructor(options) {
        super(options);
        this._reset();
    }
    _reset() {
        this._fields = [];
        this._values = [[]];
        this._valueOptions = [[]];
    }
    // Update the given field with the given value.
    // This will override any previously set value for the given field.
    _set(field, value, valueOptions = {}) {
        if (this._values.length > 1) {
            throw new Error('Cannot set multiple rows of fields this way.');
        }
        if (typeof value !== 'undefined') {
            value = this._sanitizeValue(value);
        }
        field = this._sanitizeField(field);
        // Explicity overwrite existing fields
        let index = this._fields.indexOf(field);
        // if field not defined before
        if (index === -1) {
            this._fields.push(field);
            index = this._fields.length - 1;
        }
        this._values[0][index] = value;
        this._valueOptions[0][index] = valueOptions;
    }
    // Insert fields based on the key/value pairs in the given object
    _setFields(fields, valueOptions = {}) {
        if (typeof fields !== 'object') {
            throw new Error(`Expected an object but got ${typeof fields}`);
        }
        for (const field in fields) {
            this._set(field, fields[field], valueOptions);
        }
    }
    // Insert multiple rows for the given fields. Accepts an array of objects.
    // This will override all previously set values for every field.
    _setFieldsRows(fieldsRows, valueOptions = {}) {
        if (!_isArray(fieldsRows)) {
            throw new Error(`Expected an array of objects but got ${typeof fieldsRows}`);
        }
        // Reset the objects stored fields and values
        this._reset();
        // for each row
        for (let i = 0; fieldsRows.length > i; ++i) {
            const fieldRow = fieldsRows[i];
            // for each field
            for (let field in fieldRow) {
                let value = fieldRow[field];
                field = this._sanitizeField(field);
                value = this._sanitizeValue(value);
                let index = this._fields.indexOf(field);
                if (i > 0 && index === -1) {
                    throw new Error('All fields in subsequent rows must match the fields in the first row');
                }
                // Add field only if it hasn't been added before
                if (index === -1) {
                    this._fields.push(field);
                    index = this._fields.length - 1;
                }
                // The first value added needs to add the array
                if (!_isArray(this._values[i])) {
                    this._values[i] = [];
                    this._valueOptions[i] = [];
                }
                this._values[i][index] = value;
                this._valueOptions[i][index] = valueOptions;
            }
        }
    }
}

class InsertFieldValueBlock extends AbstractSetFieldBlock {
    set(field, value, options) {
        this._set(field, value, options);
        return this;
    }
    setFields(fields, valueOptions) {
        this._setFields(fields, valueOptions);
        return this;
    }
    setFieldsRows(fieldsRows, valueOptions) {
        this._setFieldsRows(fieldsRows, valueOptions);
        return this;
    }
    _toParamString(options = {}) {
        const { buildParameterized } = options;
        const fieldString = this._fields.map((f) => this._formatFieldName(f)).join(', ');
        const valueStrings = [];
        const totalValues = [];
        for (let i = 0; i < this._values.length; ++i) {
            valueStrings[i] = '';
            for (let j = 0; j < this._values[i].length; ++j) {
                const ret = this._buildString(this.options.parameterCharacter, [this._values[i][j]], {
                    buildParameterized,
                    formattingOptions: this._valueOptions[i][j],
                });
                ret.values.forEach((value) => totalValues.push(value));
                valueStrings[i] = _pad(valueStrings[i], ', ');
                valueStrings[i] += ret.text;
            }
        }
        return {
            text: fieldString.length ? `(${fieldString}) VALUES (${valueStrings.join('), (')})` : '',
            values: totalValues,
        };
    }
}

class IntoTableBlock extends AbstractTableBlock {
    constructor(options) {
        super(_extend({}, options, {
            prefix: 'INTO',
            singleTable: true,
        }));
    }
    into(table) {
        this._table(table);
        return this;
    }
    _toParamString(options = {}) {
        if (!this._hasTable()) {
            throw new Error('into() needs to be called');
        }
        return super._toParamString(options);
    }
}

/**
 * * target table for DELETE queries, DELETE <??> FROM
 */
class TargetTableBlock extends AbstractTableBlock {
    target(table) {
        this._table(table);
        return this;
    }
}

class Select extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'SELECT'),
            new FunctionBlock(options),
            new DistinctBlock(options),
            new GetFieldBlock(options),
            new FromTableBlock(options),
            new JoinBlock(options),
            new WhereBlock(options),
            new GroupByBlock(options),
            new HavingBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
            new OffsetBlock(options),
            new UnionBlock(options),
        ];
        super(options, blocks);
    }
}

class SetFieldBlock extends AbstractSetFieldBlock {
    set(field, value, options) {
        this._set(field, value, options);
        return this;
    }
    setFields(fields, valueOptions) {
        this._setFields(fields, valueOptions);
        return this;
    }
    _toParamString(options = {}) {
        const { buildParameterized } = options;
        if (this._fields.length <= 0) {
            throw new Error('set() needs to be called');
        }
        let totalStr = '';
        const totalValues = [];
        for (let i = 0; i < this._fields.length; ++i) {
            totalStr = _pad(totalStr, ', ');
            let field = this._formatFieldName(this._fields[i]).toString();
            const value = this._values[0][i];
            // e.g. field can be an expression such as `count = count + 1`
            if (field.indexOf('=') < 0) {
                field = `${field} = ${this.options.parameterCharacter}`;
            }
            const ret = this._buildString(field, [value], {
                buildParameterized,
                formattingOptions: this._valueOptions[0][i],
            });
            totalStr += ret.text;
            ret.values.forEach((v) => totalValues.push(v));
        }
        return {
            text: `SET ${totalStr}`,
            values: totalValues,
        };
    }
}

class UpdateTableBlock extends AbstractTableBlock {
    table(table, alias = null) {
        this._table(table, alias);
        return this;
    }
    _toParamString(options = {}) {
        if (!this._hasTable()) {
            throw new Error('table() needs to be called');
        }
        return super._toParamString(options);
    }
}

class Update extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'UPDATE'),
            new UpdateTableBlock(options),
            new SetFieldBlock(options),
            new WhereBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
        ];
        super(options, blocks);
    }
}

class Insert extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'INSERT'),
            new IntoTableBlock(options),
            new InsertFieldValueBlock(options),
            new InsertFieldsFromQueryBlock(options),
        ];
        super(options, blocks);
    }
}

class Delete extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'DELETE'),
            new TargetTableBlock(options),
            new FromTableBlock(_extend({}, options, {
                singleTable: true,
            })),
            new JoinBlock(options),
            new WhereBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
        ];
        super(options, blocks);
    }
}

class Squel {
    constructor(flavour) {
        this.flavour = null;
        this.flavours = {};
        this.globalValueHandlers = [];
        // THIS WILL BE REPLACED AT BUILD TIME WITH THE PACKAGE.JSON VERSION
        this.VERSION = '1.0.0';
        // aliases
        this.remove = this.delete;
        this.flavour = flavour || null;
        this.registerValueHandler(FunctionBlock, function (value, asParam = false) {
            return asParam ? value.toParam() : value.toString();
        });
    }
    registerValueHandler(type, handler) {
        registerValueHandler(this.globalValueHandlers, type, handler);
    }
    expr(options) {
        return new Expression(options);
    }
    case(name, options) {
        return new Case(name, options);
    }
    select(options, blocks) {
        return new Select(options, blocks);
    }
    update(options, blocks) {
        return new Update(options, blocks);
    }
    insert(options, blocks) {
        return new Insert(options, blocks);
    }
    delete(options, blocks) {
        return new Delete(options, blocks);
    }
    str(...args) {
        const inst = new FunctionBlock({});
        inst.function(args[0], ...args.slice(1));
        return inst;
    }
    rstr(...args) {
        const inst = new FunctionBlock({
            rawNesting: true,
        });
        inst.function(args[0], ...args.slice(1));
        return inst;
    }
    // Setup Squel for a particular SQL flavour
    useFlavour(flavour = null) {
        if (!flavour) {
            return this;
        }
        if (this.flavours[flavour] instanceof Function) {
            const s = new Squel(flavour);
            this.flavours[flavour].call(null, s);
            // add in flavour methods
            s.flavours = this.flavours;
            s.useFlavour = this.useFlavour;
            return s;
        }
        throw new Error(`Flavour not available: ${flavour}`);
    }
}

const squel = new Squel();

exports.BaseBuilder = BaseBuilder;
exports.Block = Block;
exports.Cloneable = Cloneable;
exports.DefaultQueryBuilderOptions = DefaultQueryBuilderOptions;
exports.DistinctBlock = DistinctBlock;
exports.FromTableBlock = FromTableBlock;
exports.FunctionBlock = FunctionBlock;
exports.GetFieldBlock = GetFieldBlock;
exports.GroupByBlock = GroupByBlock;
exports.HavingBlock = HavingBlock;
exports.InsertFieldValueBlock = InsertFieldValueBlock;
exports.InsertFieldsFromQueryBlock = InsertFieldsFromQueryBlock;
exports.IntoTableBlock = IntoTableBlock;
exports.JoinBlock = JoinBlock;
exports.LimitBlock = LimitBlock;
exports.OffsetBlock = OffsetBlock;
exports.OrderByBlock = OrderByBlock;
exports.QueryBuilder = QueryBuilder;
exports.StringBlock = StringBlock;
exports.TargetTableBlock = TargetTableBlock;
exports.UnionBlock = UnionBlock;
exports.WhereBlock = WhereBlock;
exports.default = squel;
