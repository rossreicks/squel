/* eslint-disable no-plusplus */
import { AbstractSetFieldBlock } from './abstract-set-field-block';
import { _pad } from '../helpers';
import { Options } from '../types/options';

// (INSERT INTO) ... field ... value
export class InsertFieldValueBlock extends AbstractSetFieldBlock {
    set(field, value, options = {}) {
        this._set(field, value, options);
    }

    setFields(fields, valueOptions) {
        this._setFields(fields, valueOptions);
    }

    setFieldsRows(fieldsRows, valueOptions) {
        this._setFieldsRows(fieldsRows, valueOptions);
    }

    _toParamString(options: Options = {}) {
        const { buildParameterized } = options;

        const fieldString = this._fields.map((f) => this._formatFieldName(f)).join(', ');

        const valueStrings = [];
        const totalValues = [];

        for (let i = 0; i < this._values.length; ++i) {
            valueStrings[i] = '';

            for (let j = 0; j < this._values[i].length; ++j) {
                const ret = this._buildString(this.options.parameterCharacter, [this._values[i][j]], {
                    buildParameterized,
                    formattingOptions: this._valueOptions[i][j],
                });

                ret.values.forEach((value) => totalValues.push(value));

                valueStrings[i] = _pad(valueStrings[i], ', ');
                valueStrings[i] += ret.text;
            }
        }

        return {
            text: fieldString.length ? `(${fieldString}) VALUES (${valueStrings.join('), (')})` : '',
            values: totalValues,
        };
    }
}
