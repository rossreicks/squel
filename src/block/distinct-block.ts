import { Block } from './block';

export interface DistinctMixin {
    /**
     * Insert the DISTINCT keyword.
     */
    distinct(): this;
}

export class DistinctBlock extends Block implements DistinctMixin {
    private _useDistinct: boolean;

    // Add the DISTINCT keyword to the query.
    distinct() {
        this._useDistinct = true;

        return this;
    }

    _toParamString() {
        return {
            text: this._useDistinct ? 'DISTINCT' : '',
            values: [],
        };
    }
}
