import { AbstractTableBlock } from './abstract-table-block';
import { Options } from '../types/options';
import { _extend } from '../helpers';

export interface IntoTableMixin {
    /**
     * The table to insert into.
     *
     * @param name Name of table.
     */
    into(name: string): this;
}

export class IntoTableBlock extends AbstractTableBlock implements IntoTableMixin {
    constructor(options: Options) {
        super(
            _extend({}, options, {
                prefix: 'INTO',
                singleTable: true,
            })
        );
    }

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
