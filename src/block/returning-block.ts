import { BaseBuilder } from '../cls';
import { _pad } from '../helpers';
import { Field } from '../types/field';
import { Options } from '../types/options';
import { Block } from './block';

export interface ReturningMixin {
    /**
     * Add field to RETURNING clause.
     *
     * @param name Name of field OR an SQL output expression.
     * @param alias An alias by which to refer to this field. Default is `null`.
     */
    returning(name: string | BaseBuilder, alias?: string): this;
}

export class ReturningBlock extends Block implements ReturningMixin {
    _fields: Field[];

    constructor(options: Options) {
        super(options);
        this._fields = [];
    }

    returning(field: string | BaseBuilder, alias: string = null, options: Options = {}) {
        alias = alias ? this._sanitizeFieldAlias(alias) : alias;
        field = this._sanitizeField(field);

        // if field-alias combo already present then don't add
        const existingField = this._fields.filter((f) => {
            return f.name === field && f.alias === alias;
        });

        if (existingField.length) {
            return this;
        }

        this._fields.push({
            name: field,
            alias: alias,
            options: options,
        });

        return this;
    }

    _toParamString(options: Options = {}) {
        const { queryBuilder, buildParameterized } = options;

        let totalStr = '';
        const totalValues = [];

        for (const field of this._fields) {
            totalStr = _pad(totalStr, ', ');

            const { name, alias, options } = field;

            if (typeof name === 'string') {
                totalStr += this._formatFieldName(name, options);
            } else {
                const ret = name._toParamString({
                    nested: true,
                    buildParameterized: buildParameterized,
                });

                totalStr += ret.text;
                ret.values.forEach((value) => totalValues.push(value));
            }

            if (alias) {
                totalStr += ` AS ${this._formatFieldAlias(alias)}`;
            }
        }

        return {
            text: totalStr.length > 0 ? `RETURNING ${totalStr}` : '',
            values: totalValues,
        };
    }
}
