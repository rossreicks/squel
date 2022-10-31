import { BaseBuilder } from "../base-builder";
import { Options } from "../types/options";
import { Block } from "./block";

export class GroupByBlock extends Block {
    _groups: (string | BaseBuilder)[];

    constructor(options: Options) {
        super(options);

        this._groups = [];
    }

    // Add a GROUP BY transformation for the given field.
    group(field) {
        this._groups.push(this._sanitizeField(field));
    }

    _toParamString(options: Options = {}) {
        return {
            text: this._groups.length
                ? `GROUP BY ${this._groups.join(", ")}`
                : "",
            values: [],
        };
    }
}
