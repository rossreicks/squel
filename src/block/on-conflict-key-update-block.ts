import { _isArray, _pad } from '../helpers';
import { Options } from '../types/options';
import { AbstractSetFieldBlock } from './abstract-set-field-block';

export interface OnConflictKeyUpdateMixin {
    /**
     * Add `ON CONFLICT...DO UPDATE/DO NOTHING` clause.
     *
     * @param field Name of field. Default is `null`.
     * @param fieldsToSet Field-value pairs. Default is `null`.
     */
    onConflict(field?: string | string[], fieldsToSet?: { [field: string]: any }): this;
}

export class OnConflictKeyUpdateBlock extends AbstractSetFieldBlock implements OnConflictKeyUpdateMixin {
    _onConflict?: boolean;
    _dupFields?: string[];

    onConflict(conflictFields: string | string[], fields?: { [field: string]: any }) {
        this._onConflict = true;
        if (!conflictFields) {
            return;
        }
        if (!_isArray(conflictFields)) {
            conflictFields = [conflictFields];
        }
        this._dupFields = conflictFields.map(this._sanitizeField.bind(this));

        if (fields) {
            Object.keys(fields).forEach((key) => {
                this._set(key, fields[key]);
            });
        }

        return this;
    }

    _toParamString(options: Options = {}) {
        let totalStr = '';
        const totalValues = [];

        for (let i = 0; i < this._fields.length; ++i) {
            totalStr = _pad(totalStr, ', ');

            const field = this._fields[i];

            const value = this._values[0][i];

            const valueOptions = this._valueOptions[0][i];

            // e.g. if field is an expression such as: count = count + 1
            if (typeof value === 'undefined') {
                totalStr += field;
            } else {
                const ret = this._buildString(`${field} = ${this.options.parameterCharacter}`, [value], {
                    buildParameterized: options.buildParameterized,
                    formattingOptions: valueOptions,
                });

                totalStr += ret.text;
                ret.values.forEach((value) => totalValues.push(value));
            }
        }

        const returned = {
            text: '',
            values: totalValues,
        };

        if (this._onConflict) {
            // note the trailing whitespace after the join
            const conflictFields = this._dupFields ? `(${this._dupFields.join(', ')}) ` : '';
            const action = totalStr.length ? `UPDATE SET ${totalStr}` : `NOTHING`;

            returned.text = `ON CONFLICT ${conflictFields}DO ${action}`;
        }

        return returned;
    }
}
