declare class Cloneable {
    /**
     * Clone this builder
     */
    clone(): any;
}

declare abstract class Block extends BaseBuilder {
    constructor(options: Options);
    /**
     * Get input methods to expose within the query builder.
     *
     * By default all methods except the following get returned:
     *   methods prefixed with _
     *   constructor and toString()
     *
     * @return Object key -> function pairs
     */
    exposedMethods(): {};
}

declare class FunctionBlock extends Block {
    _strings: string[];
    _values: any[][];
    constructor(options: Options);
    function(str: string, ...values: any[]): void;
    _toParamString(options?: Options): {
        text: any;
        values: any[];
    };
}

/**
 * Query builder base class
 *
 * Note that the query builder does not check the final query string for correctness.
 *
 * All the build methods in this object return the object instance for chained method calling purposes.
 */
declare class QueryBuilder extends BaseBuilder {
    blocks: Block[];
    /**
     * Constructor
     *
     * blocks - array of cls.BaseBuilderBlock instances to build the query with.
     */
    constructor(options: Options, blocks: Block[]);
    /**
    # Register a custom value handler for this query builder and all its contained blocks.
    #
    # Note: This will override any globally registered handler for this value type.
    */
    registerValueHandler(type: any, handler: any): this;
    /**
    # Update query builder options
    #
    # This will update the options for all blocks too. Use this method with caution as it allows you to change the
    # behaviour of your query builder mid-build.
    */
    updateOptions(options: Options): void;
    _toParamString(options?: Options): {
        text: any;
        values: any[];
    };
    clone(): any;
    getBlock(blockType: any): Block;
}

interface Options {
    autoQuoteTableNames?: boolean;
    autoQuoteFieldNames?: boolean;
    autoQuoteAliasNames?: boolean;
    buildParameterized?: boolean;
    dontQuote?: boolean;
    useAsForTableAliasNames?: boolean;
    nameQuoteCharacter?: string;
    tableAliasQuoteCharacter?: string;
    fieldAliasQuoteCharacter?: string;
    ignorePeriodsForFieldNameQuotes?: boolean;
    queryBuilder?: QueryBuilder;
    valueHandlers?: any[];
    parameterCharacter?: string;
    nested?: boolean;
    prefix?: string;
    numberedParameters?: boolean;
    numberedParametersPrefix?: string;
    numberedParametersStartAt?: number;
    replaceSingleQuotes?: boolean;
    singleQuoteReplacement?: string;
    singleTable?: boolean;
    separator?: string;
    stringFormatter?: any;
    rawNesting?: boolean;
    verb?: string;
}

declare abstract class BaseBuilder extends Cloneable {
    globalValueHandlers: any[];
    options: Options;
    /**
     * Constructor.
     * this.param  {Object} options Overriding one or more of `cls.DefaultQueryBuilderOptions`.
     */
    constructor(options: Options);
    /**
     * Register a custom value handler for this builder instance.
     *
     * Note: this will override any globally registered handler for this value type.
     */
    registerValueHandler(type: any, handler: any): this;
    /**
     * Sanitize given expression.
     */
    _sanitizeExpression(expr: string | BaseBuilder): string | BaseBuilder;
    /**
     * Sanitize the given name.
     *
     * The 'type' parameter is used to construct a meaningful error message in case validation fails.
     */
    _sanitizeName(value: string, type: string): string;
    _sanitizeField<T extends string | BaseBuilder>(item: T): T;
    _sanitizeBaseBuilder(item: BaseBuilder): BaseBuilder;
    _sanitizeTable(item: string | BaseBuilder): string | BaseBuilder;
    _sanitizeTableAlias(item: string): string;
    _sanitizeFieldAlias(item: string): string;
    _sanitizeLimitOffset(value: string | number): number;
    _sanitizeValue(item: any): any;
    _escapeValue(value: string): string;
    _formatTableName(item: string): string;
    _formatFieldAlias(item: string): string;
    _formatTableAlias(item: string): string;
    _formatFieldName(item: string | BaseBuilder, formattingOptions?: Options): string | BaseBuilder;
    _formatCustomValue(value: any, asParam: boolean, formattingOptions?: {}): {
        formatted: boolean;
        rawNesting: boolean;
        value: any;
    } | {
        formatted: boolean;
        value: any;
        rawNesting?: undefined;
    };
    /**
     * Format given value for inclusion into parameter values array.
     */
    _formatValueForParamArray(value: any, formattingOptions?: {}): any;
    /**
     * Format the given field value for inclusion into the query string
     */
    _formatValueForQueryString(initialValue: any, formattingOptions?: Options): any;
    _applyNestingFormatting(str: any, nesting?: boolean): any;
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
    _buildString(str: string, values: any[], options?: {
        buildParameterized?: boolean;
        nested?: boolean;
        formattingOptions?: any;
    }): {
        text: any;
        values: any[];
    };
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
    _buildManyStrings(strings: string[], strValues: string[][], options?: Options): {
        text: any;
        values: any[];
    };
    /**
     * Get parameterized representation of this instance.
     *
     * @param {Object} [options] Options.
     * @param {Boolean} [options.buildParameterized] Whether to build paramterized string. Default is false.
     * @param {Boolean} [options.nested] Whether this expression is nested within another.
     * @return {Object}
     */
    abstract _toParamString(options: Options): {
        text: string;
        values: any[];
    };
    /**
     * Get the expression string.
     * @return {String}
     */
    toString(options?: Options): string;
    /**
     * Get the parameterized expression string.
     * @return {Object}
     */
    toParam(options?: Options): {
        text: string;
        values: any[];
    };
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
declare class Expression extends BaseBuilder {
    _nodes: {
        type: string;
        expr: string | BaseBuilder;
        para: any[];
    }[];
    constructor(options: any);
    and(expr: any, ...params: any[]): this;
    or(expr: any, ...params: any[]): this;
    _toParamString(options?: Options): {
        text: any;
        values: any[];
    };
}

/**
 * An SQL CASE expression builder.
 *
 * SQL cases are used to select proper values based on specific criteria.
 */
declare class Case extends BaseBuilder {
    _fieldName: string;
    _cases: {
        expression?: string;
        values: any[];
        result?: string;
    }[];
    _elseValue: string;
    constructor(fieldName: any, options?: {});
    when(expression: any, ...values: any[]): this;
    then(result: any): this;
    else(elseValue: any): this;
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

declare class Select extends QueryBuilder {
    constructor(options: any, blocks?: any);
}

declare class Update extends QueryBuilder {
    constructor(options: any, blocks?: any);
}

declare class Insert extends QueryBuilder {
    constructor(options: Options, blocks?: Block[]);
}

declare class Delete extends QueryBuilder {
    constructor(options: any, blocks?: any);
}

declare class Squel {
    flavour: any;
    flavours: {};
    globalValueHandlers: any[];
    VERSION: string;
    constructor(flavour?: string);
    registerValueHandler(type: any, handler: any): void;
    expr(options: any): Expression;
    case(name: any, options: any): Case;
    select(options: any, blocks: any): Select;
    update(options: any, blocks: any): Update;
    insert(options: any, blocks: any): Insert;
    delete(options: any, blocks: any): Delete;
    str(...args: any[]): FunctionBlock;
    rstr(...args: any[]): FunctionBlock;
    useFlavour(flavour?: any): Squel;
    remove: (options: any, blocks: any) => Delete;
}

declare const squel: Squel;

export { squel as default, squel };
