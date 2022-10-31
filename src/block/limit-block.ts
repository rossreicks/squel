import { AbstractVerbSingleValueBlock } from "./abstract-verb-single-value-block";
import { _extend } from "../helpers";

export class LimitBlock extends AbstractVerbSingleValueBlock {
    constructor(options) {
        super(
            _extend({}, options, {
                verb: "LIMIT",
            })
        );
    }

    /**
     * Set the LIMIT transformation.
     *
     * Call this will override the previously set limit for this query. Also note that Passing `null` will remove
     * the limit.
     */
    limit(limit) {
        this._setValue(limit);
    }
}
