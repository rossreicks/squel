import { AbstractTableBlock } from "./abstract-table-block";
import { Options } from "../types/options";
import { _extend } from "../helpers";

export class IntoTableBlock extends AbstractTableBlock {
    constructor(options: Options) {
        super(
            _extend({}, options, {
                prefix: "INTO",
                singleTable: true,
            })
        );
    }

    into(table) {
        this._table(table);
    }

    _toParamString(options = {}) {
        if (!this._hasTable()) {
            throw new Error("into() needs to be called");
        }

        return super._toParamString(options);
    }
}
