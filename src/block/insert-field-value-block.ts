import { AbstractSetFieldBlock } from './abstract-set-field-block';
import { Options } from '../types/options';
import { SetFieldsOptions } from '../types/set-field-options';
import { SetOptions } from '../types/set-options';
import { _pad } from '../helpers';

export interface InsertFieldValueMixin {
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
    setFields(name: { [field: string]: any }, options?: SetFieldsOptions): this;

    /**
     * Set fields to given values in the given rows (a multi-row insert).
     *
     * @param fields An array of objects, where each object is map of field-value pairs for that row
     * @param options Additional options. Default is `null`.
     */
    setFieldsRows<T extends { [field: string]: any }>(fields: T[], options?: SetFieldsOptions): this;
}

export class InsertFieldValueBlock extends AbstractSetFieldBlock implements InsertFieldValueMixin {
    set(field: string, value: any, options: SetOptions) {
        this._set(field, value, options);

        return this;
    }

    setFields(fields: { [field: string]: any }, valueOptions?: SetFieldsOptions) {
        this._setFields(fields, valueOptions);

        return this;
    }

    setFieldsRows<T extends { [field: string]: any }>(fieldsRows: T[], valueOptions?: SetFieldsOptions) {
        this._setFieldsRows(fieldsRows, valueOptions);

        return this;
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
