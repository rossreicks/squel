/* eslint-disable no-param-reassign */
import { Block } from './block';
import { BaseBuilder } from '../base-builder';
import { Options } from '../types/options';
import { _pad, isSquelBuilder } from '../helpers';

export class JoinBlock extends Block {
    _joins: { type; table; alias: string; condition: string | BaseBuilder }[];

    constructor(options) {
        super(options);

        this._joins = [];
    }

    /**
     * Add a JOIN with the given table.
     *
     * 'table' is the name of the table to join with.
     *
     * 'alias' is an optional alias for the table name.
     *
     * 'condition' is an optional condition (containing an SQL expression) for the JOIN.
     *
     * 'type' must be either one of INNER, OUTER, LEFT or RIGHT. Default is 'INNER'.
     *
     */
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
    }

    left_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'LEFT');
    }

    right_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'RIGHT');
    }

    outer_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'OUTER');
    }

    left_outer_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'LEFT OUTER');
    }

    full_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'FULL');
    }

    cross_join(table, alias = null, condition = null) {
        this.join(table, alias, condition, 'CROSS');
    }

    _toParamString(options: Options = {}) {
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
            } else {
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
