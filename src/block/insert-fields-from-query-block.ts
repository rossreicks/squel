import { BaseBuilder } from '../base-builder';
import { Block } from './block';
import { Options } from '../types/options';
import { Select } from '../methods/select';

export interface InsertFieldsFromQueryMixin {
    /**
     * Insert results of given `SELECT` query
     *
     * ex: (INSERT INTO) ... field ... (SELECT ... FROM ...)
     *
     * @param columns Names of columns to insert.
     * @param selectQry The query to run.
     */
    fromQuery(columns: string[], selectQry: Select): this;
}

export class InsertFieldsFromQueryBlock extends Block implements InsertFieldsFromQueryMixin {
    _fields: string[];
    _query: BaseBuilder | null;

    constructor(options?: Options) {
        super(options);

        this._fields = [];
        this._query = null;
    }

    fromQuery(fields: string[], selectQuery: Select) {
        this._fields = fields.map((v) => this._sanitizeField(v));

        this._query = this._sanitizeBaseBuilder(selectQuery);

        return this;
    }

    _toParamString(options: Options = {}) {
        let totalStr = '';

        let totalValues = [];

        if (this._fields.length && this._query) {
            const { text, values } = this._query._toParamString({
                buildParameterized: options.buildParameterized,
                nested: true,
            });

            totalStr = `(${this._fields.join(', ')}) ${this._applyNestingFormatting(text)}`;
            totalValues = values;
        }

        return {
            text: totalStr,
            values: totalValues,
        };
    }
}
