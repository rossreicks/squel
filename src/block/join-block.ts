import { Block } from './block';
import { BaseBuilder } from '../base-builder';
import { Expression } from '../expression';
import { Options } from '../types/options';
import { _pad, isSquelBuilder } from '../helpers';

type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'OUTER' | 'LEFT OUTER' | 'FULL' | 'CROSS';

export interface JoinMixin {
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

export class JoinBlock extends Block implements JoinMixin {
    _joins: { type: JoinType; table: string | BaseBuilder; alias: string; condition: string | Expression }[];

    constructor(options) {
        super(options);

        this._joins = [];
    }

    join(
        table: string | BaseBuilder,
        alias: string = null,
        condition: string | Expression = null,
        type: JoinType = 'INNER'
    ) {
        table = this._sanitizeTable(table);
        alias = alias ? this._sanitizeTableAlias(alias) : alias;
        condition = condition ? (this._sanitizeExpression(condition) as any) : condition;

        this._joins.push({
            type,
            table,
            alias,
            condition,
        });

        return this;
    }

    left_join(table: string | BaseBuilder, alias: string = null, condition: string | Expression = null) {
        this.join(table, alias, condition, 'LEFT');

        return this;
    }

    right_join(table: string | BaseBuilder, alias: string = null, condition: string | Expression = null) {
        this.join(table, alias, condition, 'RIGHT');

        return this;
    }

    outer_join(table: string | BaseBuilder, alias: string = null, condition: string | Expression = null) {
        this.join(table, alias, condition, 'OUTER');

        return this;
    }

    left_outer_join(table: string | BaseBuilder, alias: string = null, condition: string | Expression = null) {
        this.join(table, alias, condition, 'LEFT OUTER');

        return this;
    }

    full_join(table: string | BaseBuilder, alias: string = null, condition: string | Expression = null) {
        this.join(table, alias, condition, 'FULL');

        return this;
    }

    cross_join(table: string | BaseBuilder, alias: string = null, condition: string | Expression = null) {
        this.join(table, alias, condition, 'CROSS');

        return this;
    }

    _toParamString(options: Options = {}) {
        let totalStr = '';
        const totalValues = [];

        for (const { type, table, alias, condition } of this._joins) {
            totalStr = _pad(totalStr, this.options.separator);

            let tableStr;

            if (isSquelBuilder(table)) {
                const ret = (table as BaseBuilder)._toParamString({
                    buildParameterized: options.buildParameterized,
                    nested: true,
                });

                ret.values.forEach((value) => totalValues.push(value));
                tableStr = ret.text;
            } else {
                tableStr = this._formatTableName(table as string);
            }

            totalStr += `${type} JOIN ${tableStr}`;

            if (alias) {
                totalStr += ` ${this._formatTableAlias(alias)}`;
            }

            if (condition) {
                totalStr += ' ON ';

                let ret;

                if (isSquelBuilder(condition)) {
                    ret = (condition as BaseBuilder)._toParamString({
                        buildParameterized: options.buildParameterized,
                    });
                } else {
                    ret = this._buildString(condition as string, [], {
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
