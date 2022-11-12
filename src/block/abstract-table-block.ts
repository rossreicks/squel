/* eslint-disable no-param-reassign */
import { Block } from './block';
import { Options } from '../types/options';
import { _pad, isSquelBuilder } from '../helpers';
import { BaseBuilder } from '../base-builder';

export abstract class AbstractTableBlock extends Block {
    private _tables: { table: string | BaseBuilder; alias: string }[];

    /**
     * @param {Boolean} [options.singleTable] If true then only allow one table spec.
     * @param {String} [options.prefix] String prefix for output.
     */
    constructor(options: Options, prefix?: string) {
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
    _table(table: string | BaseBuilder, alias = null) {
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
    _toParamString(options: Options = {}) {
        let totalStr = '';
        const totalValues = [];

        if (this._hasTable()) {
            // retrieve the parameterized queries
            for (const { table, alias } of this._tables) {
                totalStr = _pad(totalStr, ', ');

                let tableStr;

                if (isSquelBuilder(table)) {
                    const { text, values } = (table as BaseBuilder)._toParamString({
                        buildParameterized: options.buildParameterized,
                        nested: true,
                    });

                    tableStr = text;
                    values.forEach((value) => totalValues.push(value));
                } else {
                    tableStr = this._formatTableName(table as string);
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
