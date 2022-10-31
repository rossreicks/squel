import { BaseBuilder } from "../base-builder";
import { Options } from "../types/options";
import { Block } from "./block";

// (INSERT INTO) ... field ... (SELECT ... FROM ...)
export class InsertFieldsFromQueryBlock extends Block {
    _fields: string[];
    _query: BaseBuilder | null;

    constructor(options) {
        super(options);

        this._fields = [];
        this._query = null;
    }

    fromQuery(fields, selectQuery) {
        this._fields = fields.map((v) => this._sanitizeField(v));

        this._query = this._sanitizeBaseBuilder(selectQuery);
    }

    _toParamString(options: Options = {}) {
        let totalStr = "";

        let totalValues = [];

        if (this._fields.length && this._query) {
            const { text, values } = this._query._toParamString({
                buildParameterized: options.buildParameterized,
                nested: true,
            });

            totalStr = `(${this._fields.join(
                ", "
            )}) ${this._applyNestingFormatting(text)}`;
            totalValues = values;
        }

        return {
            text: totalStr,
            values: totalValues,
        };
    }
}
