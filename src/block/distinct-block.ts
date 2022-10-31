import { Block } from './block';

export class DistinctBlock extends Block {
    private _useDistinct: boolean;

    // Add the DISTINCT keyword to the query.
    distinct() {
        this._useDistinct = true;
    }

    _toParamString() {
        return {
            text: this._useDistinct ? 'DISTINCT' : '',
            values: [],
        };
    }
}
