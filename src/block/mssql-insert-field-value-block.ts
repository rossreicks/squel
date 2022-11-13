import { Options } from '../types/options';
import { InsertFieldValueBlock, InsertFieldValueMixin } from './insert-field-value-block';

export interface MssqlInsertFieldValueMixin extends InsertFieldValueMixin {
    /**
     * Add field to OUTPUT clause.
     *
     * @param name Name of field or array of field names.
     */
    output(name: string | string[]): this;
}

export class MssqlInsertFieldValueBlock extends InsertFieldValueBlock implements MssqlInsertFieldValueMixin {
    _outputs: string[];

    constructor(options: Options) {
        super(options);
        this._outputs = [];
    }

    // add fields to the output clause
    output(fields: string | string[]) {
        if ('string' === typeof fields) {
            this._outputs.push(`INSERTED.${this._sanitizeField(fields)}`);
        } else {
            fields.forEach((f) => {
                this._outputs.push(`INSERTED.${this._sanitizeField(f)}`);
            });
        }

        return this;
    }

    _toParamString(options) {
        const ret = super._toParamString(options);

        if (ret.text.length && 0 < this._outputs.length) {
            const innerStr = `OUTPUT ${this._outputs.join(', ')} `;

            const valuesPos = ret.text.indexOf('VALUES');

            ret.text = ret.text.substr(0, valuesPos) + innerStr + ret.text.substr(valuesPos);
        }

        return ret;
    }
}
