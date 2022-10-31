/* eslint-disable no-plusplus */
import { AbstractSetFieldBlock } from './abstract-set-field-block';
import { Options } from '../types/options';
import { _pad } from '../helpers';

/*
 *(UPDATE) SET field=value
 */
export class SetFieldBlock extends AbstractSetFieldBlock {
    set(field, value, options) {
        this._set(field, value, options);
    }

    setFields(fields, valueOptions) {
        this._setFields(fields, valueOptions);
    }

    _toParamString(options: Options = {}) {
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
