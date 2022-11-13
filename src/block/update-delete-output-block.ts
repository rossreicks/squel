import { _pad } from '../helpers';
import { Options } from '../types/options';
import { Block } from '.';

interface Output {
    name: string;
    alias: string | null;
}

export interface UpdateDeleteOutputMixin {
    /**
     * Add field to OUTPUT clause.
     *
     * @param name Name of field.
     * @param alias An alias by which to refer to this field. Default is null.
     */
    output(name: string, alias?: string): this;

    /**
     * Add fields to `OUTPUT` clause.
     *
     * @param fields List of field:alias pairs.
     */
    outputs(fields: { [field: string]: any }): this;
}

export class UpdateDeleteOutputBlock extends Block implements UpdateDeleteOutputMixin {
    _outputs: Output[];

    constructor(options: Options) {
        super(options);
        this._outputs = [];
    }

    /**
    # Add the given fields to the final result set.
    #
    # The parameter is an Object containing field names (or database functions) as the keys and aliases for the fields
    # as the values. If the value for a key is null then no alias is set for that field.
    #
    # Internally this method simply calls the field() method of this block to add each individual field.
    */
    outputs(outputs: { [field: string]: any }) {
        for (const output in outputs) {
            this.output(output, outputs[output]);
        }

        return this;
    }

    /**
    # Add the given field to the final result set.
    #
    # The 'field' parameter does not necessarily have to be a fieldname. It can use database functions too,
    # e.g. DATE_FORMAT(a.started, "%H")
    #
    # An alias may also be specified for this field.
    */
    output(output: string, alias?: string) {
        output = this._sanitizeField(output);
        alias = alias ? this._sanitizeFieldAlias(alias) : alias;

        this._outputs.push({
            name: this.options.forDelete ? `DELETED.${output}` : `INSERTED.${output}`,
            alias: alias,
        });

        return this;
    }

    _toParamString() {
        let totalStr = '';

        if (this._outputs.length) {
            for (const output of this._outputs) {
                totalStr = _pad(totalStr, ', ');

                totalStr += output.name;

                if (output.alias) {
                    totalStr += ` AS ${this._formatFieldAlias(output.alias)}`;
                }
            }

            totalStr = `OUTPUT ${totalStr}`;
        }

        return {
            text: totalStr,
            values: [],
        };
    }
}
