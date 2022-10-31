/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable no-param-reassign */
import { BaseBuilder } from "../base-builder";
import { Block } from "./block";
import { Options } from "../types/options";
import { _isArray, _pad } from "../helpers";

type OrderByDirection = "ASC" | "DESC";

export class OrderByBlock extends Block {
    _orders: {
        field: string | BaseBuilder;
        dir: OrderByDirection;
        values: any[];
    }[];

    constructor(options: Options) {
        super(options);

        this._orders = [];
    }

    /**
     * Add an ORDER BY transformation for the given field in the given order.
     *
     * To specify descending order pass false for the 'dir' parameter.
     */
    order(field: string | BaseBuilder, dir?: OrderByDirection, ...values) {
        field = this._sanitizeField(field);

        if (!(typeof dir === "string")) {
            if (dir === undefined) {
                dir = "ASC"; // Default to asc
            } else if (dir !== null) {
                dir = dir ? "ASC" : "DESC"; // Convert truthy to asc
            }
        }

        this._orders.push({
            field,
            dir,
            values: values || [],
        });
    }

    _toParamString(options: Options = {}) {
        let totalStr = "";
        const totalValues = [];

        for (const { field, dir, values } of this._orders) {
            totalStr = _pad(totalStr, ", ");

            const ret = this._buildString(field.toString(), values, {
                buildParameterized: options.buildParameterized,
            });

            (totalStr += ret.text),
                _isArray(ret.values) &&
                    ret.values.forEach((value) => totalValues.push(value));

            if (dir !== null) {
                totalStr += ` ${dir}`;
            }
        }

        return {
            text: totalStr.length ? `ORDER BY ${totalStr}` : "",
            values: totalValues,
        };
    }
}
