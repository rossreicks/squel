import { AbstractSetFieldBlock } from './abstract-set-field-block';
import { Options } from '../types/options';
import { SetFieldsOptions } from '../types/set-field-options';
import { SetOptions } from '../types/set-options';
import { _pad } from '../helpers';

export interface SetFieldMixin {
    /**
     * Set a field to a value.
     *
     * @param name Name of field or an operation.
     * @param value Value to set to field. Default is `undefined`.
     * @param options Additional options. Default is `null`.
     */
    set(name: string, value?: any, options?: SetOptions): this;

    /**
     * Set fields to given values.
     *
     * @param fields Field-value pairs.
     * @param options Additional options. Default is `null`.
     */
    setFields(fields: { [field: string]: any }, options?: SetFieldsOptions): this;
}

export class SetFieldBlock extends AbstractSetFieldBlock implements SetFieldMixin {
    set(field: string, value: any, options: SetOptions) {
        this._set(field, value, options);

        return this;
    }

    setFields(fields: { [field: string]: any }, valueOptions: SetFieldsOptions) {
        this._setFields(fields, valueOptions);

        return this;
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
