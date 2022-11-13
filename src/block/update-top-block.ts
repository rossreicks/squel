import { Options } from '../types/options';
import { Block } from './block';

export interface UpdateTopMixin {
    /**
     * Add a LIMIT clause.
     *
     * @param limit Number of records to limit the query to.
     */
    limit(limit: number): this;

    /**
     * Insert the `TOP` keyword to limit the number of rows returned.
     *
     * @param num Number of rows or percentage of rows to limit to
     */
    top(num: number): this;
}

export class UpdateTopBlock extends Block implements UpdateTopMixin {
    _limits: null | number;

    constructor(options: Options) {
        super(options);
        this._limits = null;
    }

    limit(max: number) {
        this._limits = this._sanitizeLimitOffset(max);

        return this;
    }

    top(num: number) {
        return this.limit(num);
    }

    _toParamString() {
        return {
            text: this._limits ? `TOP (${this._limits})` : '',
            values: [],
        };
    }
}
