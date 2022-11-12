import { AbstractVerbSingleValueBlock } from './abstract-verb-single-value-block';
import { _extend } from '../helpers';

export interface OffsetMixin {
    /**
     * Add an OFFSET clause.
     *
     * @param limit Index of record to start fetching from.
     */
    offset(limit: number): this;
}

export class OffsetBlock extends AbstractVerbSingleValueBlock implements OffsetMixin {
    constructor(options) {
        super(
            _extend({}, options, {
                verb: 'OFFSET',
            })
        );
    }

    offset(start: number) {
        this._setValue(start);

        return this;
    }
}
