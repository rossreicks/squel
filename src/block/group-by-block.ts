import { BaseBuilder } from '../base-builder';
import { Options } from '../types/options';
import { Block } from './block';

export interface GroupByMixin {
    /**
     * Add an GROUP BY clause.
     *
     * @param field Name of field to group by.
     */
    group(field: string): this;
}

export class GroupByBlock extends Block implements GroupByMixin {
    _groups: (string | BaseBuilder)[];

    constructor(options: Options) {
        super(options);

        this._groups = [];
    }

    group(field: string) {
        this._groups.push(this._sanitizeField(field));

        return this;
    }

    _toParamString(options: Options = {}) {
        return {
            text: this._groups.length ? `GROUP BY ${this._groups.join(', ')}` : '',
            values: [],
        };
    }
}
