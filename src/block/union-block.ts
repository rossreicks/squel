/* eslint-disable no-param-reassign */
import { Block } from "./block";
import { BaseBuilder } from "../base-builder";
import { Options } from "../types/options";
import { _pad } from "../helpers";

export class UnionBlock extends Block {
    _unions: { table: string | BaseBuilder; type: string }[];

    constructor(options: Options) {
        super(options);

        this._unions = [];
    }

    /**
     * Add a UNION with the given table/query.
     *
     * 'table' is the name of the table or query to union with.
     *
     * 'type' must be either one of UNION or UNION ALL.... Default is 'UNION'.
     */
    union(table, type = "UNION") {
        table = this._sanitizeTable(table);

        this._unions.push({
            type,
            table,
        });
    }

    // Add a UNION ALL with the given table/query.
    union_all(table) {
        this.union(table, "UNION ALL");
    }

    _toParamString(options: Options = {}) {
        let totalStr = "";
        const totalValues = [];

        for (const { type, table } of this._unions) {
            totalStr = _pad(totalStr, this.options.separator);

            let tableStr;

            if (table instanceof BaseBuilder) {
                const ret = table._toParamString({
                    buildParameterized: options.buildParameterized,
                    nested: true,
                });

                tableStr = ret.text;
                ret.values.forEach((value) => totalValues.push(value));
            } else {
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
