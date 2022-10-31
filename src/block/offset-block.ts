import { AbstractVerbSingleValueBlock } from './abstract-verb-single-value-block';
import { _extend } from '../helpers';

export class OffsetBlock extends AbstractVerbSingleValueBlock {
    constructor(options) {
        super(
            _extend({}, options, {
                verb: 'OFFSET',
            })
        );
    }

    /**
     * Set the OFFSET transformation.
     *
     * Call this will override the previously set offset for this query. Also note that Passing 0 for 'max' will remove
     * the offset.
     */
    offset(start) {
        this._setValue(start);
    }
}
