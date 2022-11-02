import { AbstractVerbSingleValueBlock } from './abstract-verb-single-value-block';
import { _extend } from '../helpers';

export interface LimitMixin {
    /**
     * Add a LIMIT clause.
     *
     * @param limit Number of records to limit the query to.
     */
    limit(limit: number): this;
}

export class LimitBlock extends AbstractVerbSingleValueBlock implements LimitMixin {
    constructor(options) {
        super(
            _extend({}, options, {
                verb: 'LIMIT',
            })
        );
    }

    limit(limit: number) {
        this._setValue(limit);

        return this;
    }
}
