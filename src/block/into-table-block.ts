import { AbstractTableBlock } from './abstract-table-block';
import { Options } from '../types/options';
import { _extend } from '../helpers';

export interface IntoTableMixin {
    into(name: string): this;
}

/**
 * Mixin for INTO table clause
 *
 * @example
 * insert().into('table'); // INSERT INTO `table`
 *
 * @extends AbstractTableBlock
 * @mixin IntoTableMixin
 */
export class IntoTableBlock extends AbstractTableBlock implements IntoTableMixin {
    constructor(options?: Options) {
        super(
            _extend({}, options, {
                prefix: 'INTO',
                singleTable: true,
            })
        );
    }

    /**
     * The table to insert into.
     * @param {string} table The table name.
     */
    into(table: string) {
        this._table(table);

        return this;
    }

    _toParamString(options = {}) {
        if (!this._hasTable()) {
            throw new Error('into() needs to be called');
        }

        return super._toParamString(options);
    }
}
