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

interface FunctionMixin {
    /**
     * Insert a function value, see [[FunctionBlock]].
     */
    function(str: string, ...value: any[]): this;
}
/**
 * A function string block
 */
declare class FunctionBlock extends Block implements FunctionMixin {
    _strings: string[];
    _values: any[][];
    constructor(options: Options);
    function(str: string, ...values: any[]): this;
    _toParamString(options?: Options): {
        text: any;
        values: any[];
    };
}

declare class StringBlock extends Block {
    _str: string;
    constructor(options: Options, str: string);
    _toParamString(options?: {}): {
        text: string;
        values: any[];
    };
}

interface DistinctMixin {
    /**
     * Insert the DISTINCT keyword.
     */
    distinct(): this;
}
declare class DistinctBlock extends Block implements DistinctMixin {
    private _useDistinct;
    distinct(): this;
    _toParamString(): {
        text: string;
        values: any[];
    };
}

interface FieldOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within field
     * names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes?: boolean;
}

interface GetFieldMixin {
    /**
     * Add the given field to the final result set.
     *
     * The 'field' parameter does not necessarily have to be a field name. It can use database functions too,
     * e.g. DATE_FORMAT(a.started, "%H")
     *
     * An alias may also be specified for this field.
     *
     * @param name Name of field OR an SQL expression such as `DATE_FORMAT` OR a builder.
     * @param alias An alias by which to refer to this field. Default is `null`.
     * @param options Additional options. Default is `null`.
     */
    field(name: string | BaseBuilder, alias?: string, options?: FieldOptions): this;
    /**
     * Add the given fields to the final result set.
     *
     * The parameter is an Object containing field names (or database functions) as the keys and aliases for the fields
     * as the values. If the value for a key is null then no alias is set for that field.
     *
     * @param fields List of field:alias pairs OR Array of field names
     * @param options Additional options. Default is `null`.
     */
    fields(fields: {
        [field: string]: string;
    } | string[], options?: FieldOptions): this;
}
declare class GetFieldBlock extends Block implements GetFieldMixin {
    _fields: {
        name: string | BaseBuilder;
        alias: string;
        options: Options;
    }[];
    constructor(options: Options);
    fields(_fields: {
        [field: string]: string;
    } | string[], options?: FieldOptions): this;
    field(field: string | BaseBuilder, alias?: string, options?: FieldOptions): this;
    _toParamString(opts?: Options): {
        text: string;
        values: any[];
    };
}

declare abstract class AbstractTableBlock extends Block {
    private _tables;
    /**
     * @param {Boolean} [options.singleTable] If true then only allow one table spec.
     * @param {String} [options.prefix] String prefix for output.
     */
    constructor(options: Options, prefix?: string);
    /**
     * Update given table.
     *
     * An alias may also be specified for the table.
     *
     * Concrete subclasses should provide a method which calls this
     */
    _table(table: string | BaseBuilder, alias?: any): void;
    _hasTable(): boolean;
    /**
     * @override
     */
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

interface FromTableMixin {
    /**
     * A table to select data from.
     *
     * @param name Name of table or a builder.
     * @param alias An alias by which to refer to this table. Default is null.
     */
    from(name: string | BaseBuilder, alias?: string): this;
}
declare class FromTableBlock extends AbstractTableBlock implements FromTableMixin {
    constructor(options: Options);
    from(table: string | BaseBuilder, alias?: string): this;
}

declare type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'OUTER' | 'LEFT OUTER' | 'FULL' | 'CROSS';
interface JoinMixin {
    /**
     * Add an INNER JOIN.
     *
     * @param name The table to join on. Can be a a [[BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    join(name: string | BaseBuilder, alias?: string, condition?: string | Expression, join_type?: JoinType): this;
    /**
     * Add a LEFT JOIN.
     *
     * @param name The table to join on. Can be a a [[cls.BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    left_join(name: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    /**
     * Add a RIGHT JOIN.
     *
     * @param name The table to join on. Can be a a [[cls.BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    right_join(name: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    /**
     * Add a OUTER JOIN.
     *
     * @param name The table to join on. Can be a a [[cls.BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    outer_join(name: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    /**
     * Add a CROSS JOIN.
     *
     * @param name The table to join on. Can be a a [[cls.BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    cross_join(name: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
}
declare class JoinBlock extends Block implements JoinMixin {
    _joins: {
        type: JoinType;
        table: string | BaseBuilder;
        alias: string;
        condition: string | Expression;
    }[];
    constructor(options: any);
    join(table: string | BaseBuilder, alias?: string, condition?: string | Expression, type?: JoinType): this;
    left_join(table: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    right_join(table: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    outer_join(table: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    left_outer_join(table: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    full_join(table: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    cross_join(table: string | BaseBuilder, alias?: string, condition?: string | Expression): this;
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

declare abstract class AbstractConditionBlock extends Block {
    private _conditions;
    /**
     * @param {String} options.verb The condition verb.
     */
    constructor(options: any);
    /**
     * Add a condition.
     *
     * When the final query is constructed all the conditions are combined using the intersection (AND) operator.
     *
     * Concrete subclasses should provide a method which calls this
     */
    _condition(condition: string | BaseBuilder, ...values: any[]): void;
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

interface WhereMixin {
    /**
     * Add a WHERE condition.
     *
     * @param condition The condition expression.
     * @param args Additional arguments for parameter substitution. See guide for examples. Default is `null`.
     */
    where(condition: string | Expression, ...args: any[]): this;
}
declare class WhereBlock extends AbstractConditionBlock implements WhereMixin {
    constructor(options: Options);
    where(condition: string | Expression, ...values: any[]): this;
}

interface GroupByMixin {
    /**
     * Add an GROUP BY clause.
     *
     * @param field Name of field to group by.
     */
    group(field: string): this;
}
declare class GroupByBlock extends Block implements GroupByMixin {
    _groups: (string | BaseBuilder)[];
    constructor(options: Options);
    group(field: string): this;
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

interface HavingMixin {
    /**
     * Add a HAVING condition.
     *
     * @param condition The condition expression.
     * @param args Additional arguments for parameter substitution. See guide for examples. Default
     *             is `null`.
     */
    having(condition: string | Expression, ...args: any[]): this;
}
declare class HavingBlock extends AbstractConditionBlock implements HavingMixin {
    constructor(options: Options);
    having(condition: string | Expression, ...values: any[]): this;
}

declare type OrderByDirection = 'ASC' | 'DESC';
interface OrderByMixin {
    /**
     * Add an ORDER BY clause.
     *
     * @param field Name of field to sort by.
     * @param direction Sort direction. `true` = ascending, `false` = descending, `null` = no direction set.
     *                  Default is `true`.
     * @param values List of parameter values specified as additional arguments. Default is `[]`.
     */
    order(field: string, direction?: boolean | null | OrderByDirection, ...values: any[]): this;
}
declare class OrderByBlock extends Block implements OrderByMixin {
    _orders: {
        field: string | BaseBuilder;
        dir: OrderByDirection;
        values: any[];
    }[];
    constructor(options: Options);
    /**
     * Add an ORDER BY transformation for the given field in the given order.
     *
     * To specify descending order pass false for the 'dir' parameter.
     */
    order(field: string | BaseBuilder, dir?: boolean | null | OrderByDirection, ...values: any[]): this;
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

declare abstract class AbstractVerbSingleValueBlock extends Block {
    private _value;
    /**
     * @param options.verb The prefix verb string.
     */
    constructor(options: any);
    _setValue(value: any): void;
    _toParamString(options?: Options): {
        text: any;
        values: any[];
    };
}

interface LimitMixin {
    /**
     * Add a LIMIT clause.
     *
     * @param limit Number of records to limit the query to.
     */
    limit(limit: number): this;
}
declare class LimitBlock extends AbstractVerbSingleValueBlock implements LimitMixin {
    constructor(options: any);
    limit(limit: number): this;
}

interface OffsetMixin {
    /**
     * Add an OFFSET clause.
     *
     * @param limit Index of record to start fetching from.
     */
    offset(limit: number): this;
}
declare class OffsetBlock extends AbstractVerbSingleValueBlock implements OffsetMixin {
    constructor(options: any);
    offset(start: number): this;
}

declare type UnionType = 'UNION' | 'UNION ALL';
interface UnionMixin {
    /**
     * Combine with another `SELECT` using `UNION`.
     *
     * @param query Another `SELECT` query to combine this query with.
     */
    union(query: QueryBuilder, unionType?: UnionType): this;
    /**
     * Combine with another `SELECT` using `UNION ALL`.
     *
     * @param query Another `SELECT` query to combine this query with.
     */
    union_all(query: QueryBuilder): this;
}
declare class UnionBlock extends Block implements UnionMixin {
    _unions: {
        table: string | QueryBuilder;
        type: UnionType;
    }[];
    constructor(options: Options);
    union(table: string | QueryBuilder, type?: UnionType): this;
    union_all(table: string | QueryBuilder): this;
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

interface Select extends QueryBuilder, FunctionMixin, DistinctMixin, GetFieldMixin, FromTableMixin, JoinMixin, WhereMixin, GroupByMixin, HavingMixin, OrderByMixin, LimitMixin, OffsetMixin, UnionMixin {
}
declare class Select extends QueryBuilder {
    constructor(options: any, blocks?: any);
}

interface InsertFieldsFromQueryMixin {
    /**
     * Insert results of given `SELECT` query
     *
     * ex: (INSERT INTO) ... field ... (SELECT ... FROM ...)
     *
     * @param columns Names of columns to insert.
     * @param selectQry The query to run.
     */
    fromQuery(columns: string[], selectQry: Select): this;
}
declare class InsertFieldsFromQueryBlock extends Block implements InsertFieldsFromQueryMixin {
    _fields: string[];
    _query: BaseBuilder | null;
    constructor(options: any);
    fromQuery(fields: string[], selectQuery: Select): this;
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

/**
 * Base class for setting fields to values (used for INSERT and UPDATE queries)
 */
declare abstract class AbstractSetFieldBlock extends Block {
    _fields: (string | BaseBuilder)[];
    _values: any[][];
    _valueOptions: any[][];
    constructor(options: any);
    _reset(): void;
    _set(field: any, value: any, valueOptions?: {}): void;
    _setFields(fields: any, valueOptions?: {}): void;
    _setFieldsRows(fieldsRows: any, valueOptions?: {}): void;
}

/**
 * Additional options for `update().setFields()`.
 */
interface SetFieldsOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within
     * field names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes?: boolean;
}

/**
 * Additional options for `update().set()`.
 */
interface SetOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within
     * field names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes?: boolean;
    /**
     * If set and the value is a String then it will not be quoted in the output Default is `false`.
     */
    dontQuote?: boolean;
}

interface InsertFieldValueMixin {
    /**
     * Set a field to a value.
     *
     * @param name Name of field.
     * @param value Value to set to field.
     * @param options Additional options. Default is `null`.
     */
    set(name: string, value: any, options?: SetOptions): this;
    /**
     * Set fields to given values.
     *
     * @param name Field-value pairs.
     * @param options Additional options. Default is `null`.
     */
    setFields(name: {
        [field: string]: any;
    }, options?: SetFieldsOptions): this;
    /**
     * Set fields to given values in the given rows (a multi-row insert).
     *
     * @param fields An array of objects, where each object is map of field-value pairs for that row
     * @param options Additional options. Default is `null`.
     */
    setFieldsRows<T extends {
        [field: string]: any;
    }>(fields: T[], options?: SetFieldsOptions): this;
}
declare class InsertFieldValueBlock extends AbstractSetFieldBlock implements InsertFieldValueMixin {
    set(field: string, value: any, options: SetOptions): this;
    setFields(fields: {
        [field: string]: any;
    }, valueOptions?: SetFieldsOptions): this;
    setFieldsRows<T extends {
        [field: string]: any;
    }>(fieldsRows: T[], valueOptions?: SetFieldsOptions): this;
    _toParamString(options?: Options): {
        text: string;
        values: any[];
    };
}

interface IntoTableMixin {
    /**
     * The table to insert into.
     *
     * @param name Name of table.
     */
    into(name: string): this;
}
declare class IntoTableBlock extends AbstractTableBlock implements IntoTableMixin {
    constructor(options: Options);
    into(table: string): this;
    _toParamString(options?: {}): {
        text: string;
        values: any[];
    };
}

interface TargetTableMixin {
    /**
     * The actual target table whose data is to be deleted. Used in conjunction with `from()`.
     *
     * @param table Name of table.
     */
    target(table: string): this;
}
/**
 * * target table for DELETE queries, DELETE <??> FROM
 */
declare class TargetTableBlock extends AbstractTableBlock implements TargetTableMixin {
    target(table: string): this;
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
     * Register a custom value handler for this query builder and all its contained blocks.
     *
     * Note: This will override any globally registered handler for this value type.
     */
    registerValueHandler(type: any, handler: any): this;
    /**
     * Update query builder options
     *
     * This will update the options for all blocks too. Use this method with caution as it allows you to change the
     * behaviour of your query builder mid-build.
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

declare const DefaultQueryBuilderOptions: {
    autoQuoteTableNames: boolean;
    autoQuoteFieldNames: boolean;
    autoQuoteAliasNames: boolean;
    useAsForTableAliasNames: boolean;
    nameQuoteCharacter: string;
    tableAliasQuoteCharacter: string;
    fieldAliasQuoteCharacter: string;
    valueHandlers: any[];
    parameterCharacter: string;
    numberedParameters: boolean;
    numberedParametersPrefix: string;
    numberedParametersStartAt: number;
    replaceSingleQuotes: boolean;
    singleQuoteReplacement: string;
    separator: string;
    stringFormatter: any;
    rawNesting: boolean;
};
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

interface SetFieldMixin {
    /**
     * Set a field to a value.
     *
     * @param name Name of field or an operation.
     * @param value Value to set to field. Default is `undefined`.
     * @param options Additional options. Default is `null`.
     */
    set(name: string, value?: any, options?: SetOptions): this;
    /**
     * Set fields to given values.
     *
     * @param fields Field-value pairs.
     * @param options Additional options. Default is `null`.
     */
    setFields(fields: {
        [field: string]: any;
    }, options?: SetFieldsOptions): this;
}

interface UpdateTableMixin {
    /**
     * A table to update.
     *
     * @param name Name of table.
     * @param alias An alias by which to refer to this table. Default is `null`.
     */
    table(name: string, alias?: string): this;
}

interface Update extends QueryBuilder, UpdateTableMixin, SetFieldMixin, WhereMixin, OrderByMixin, LimitMixin {
}
declare class Update extends QueryBuilder {
    constructor(options: any, blocks?: any);
}

interface Insert extends QueryBuilder, IntoTableMixin, InsertFieldValueMixin, InsertFieldsFromQueryMixin {
}
declare class Insert extends QueryBuilder {
    constructor(options: Options, blocks?: Block[]);
}

interface Delete extends QueryBuilder, TargetTableMixin, FromTableMixin, JoinMixin, WhereMixin, OrderByMixin, LimitMixin {
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

export { BaseBuilder, Block, Cloneable, DefaultQueryBuilderOptions, DistinctBlock, DistinctMixin, FromTableBlock, FromTableMixin, FunctionBlock, FunctionMixin, GetFieldBlock, GetFieldMixin, GroupByBlock, GroupByMixin, HavingBlock, HavingMixin, InsertFieldValueBlock, InsertFieldValueMixin, InsertFieldsFromQueryBlock, InsertFieldsFromQueryMixin, IntoTableBlock, IntoTableMixin, JoinBlock, JoinMixin, LimitBlock, LimitMixin, OffsetBlock, OffsetMixin, OrderByBlock, OrderByMixin, QueryBuilder, StringBlock, TargetTableBlock, TargetTableMixin, UnionBlock, UnionMixin, WhereBlock, WhereMixin, squel as default };
