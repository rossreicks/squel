/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { BaseBuilder } from "../base-builder";
import { Block } from "./block";
import { FromTableBlock } from "./from-table-block";
import { Options } from "../types/options";
import { _isArray, _pad } from "../helpers";
import { AbstractTableBlock } from "./abstract-table-block";

export class GetFieldBlock extends Block {
    _fields: { name: string | BaseBuilder; alias: string; options: Options }[];

    constructor(options: Options) {
        super(options);

        this._fields = [];
    }

    /**
     * Add the given fields to the final result set.
     *
     * The parameter is an Object containing field names (or database functions) as the keys and aliases for the fields
     * as the values. If the value for a key is null then no alias is set for that field.
     *
     * Internally this method simply calls the field() method of this block to add each individual field.
     *
     * options.ignorePeriodsForFieldNameQuotes - whether to ignore period (.) when automatically quoting the field name
     */
    fields(_fields, options = {}) {
        if (_isArray(_fields)) {
            for (const field of _fields) {
                this.field(field, null, options);
            }
        } else {
            for (const field in _fields) {
                const alias = _fields[field];

                this.field(field, alias, options);
            }
        }
    }

    /**
     * Add the given field to the final result set.
     *
     * The 'field' parameter does not necessarily have to be a fieldname. It can use database functions too,
     * e.g. DATE_FORMAT(a.started, "%H")
     *
     * An alias may also be specified for this field.
     *
     * options.ignorePeriodsForFieldNameQuotes - whether to ignore period (.) when automatically quoting the field name
     */
    field(field, alias = null, options: Options = {}) {
        alias = alias ? this._sanitizeFieldAlias(alias) : alias;
        field = this._sanitizeField(field);

        // if field-alias combo already present then don't add
        const existingField = this._fields.filter(
            (f) => f.name === field && f.alias === alias
        );
        if (existingField.length) {
            return this;
        }

        this._fields.push({
            name: field,
            alias,
            options,
        });
    }

    _toParamString(opts: Options = {}) {
        const { queryBuilder, buildParameterized } = opts;

        let totalStr = "";
        const totalValues = [];

        for (const field of this._fields) {
            totalStr = _pad(totalStr, ", ");

            const { name, alias, options } = field;

            if (typeof name === "string") {
                totalStr += this._formatFieldName(name, options);
            } else {
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
            const fromTableBlock =
                queryBuilder && queryBuilder.getBlock(FromTableBlock);
            if (
                fromTableBlock &&
                fromTableBlock instanceof AbstractTableBlock &&
                fromTableBlock._hasTable()
            ) {
                totalStr = "*";
            }
        }

        return {
            text: totalStr,
            values: totalValues,
        };
    }
}
