import { AbstractTableBlock } from './abstract-table-block';
import { BaseBuilder } from '../base-builder';
import { Options } from '../types/options';
import { _extend } from '../helpers';

export interface FromTableMixin {
    /**
     * A table to select data from.
     *
     * @param name Name of table or a builder.
     * @param alias An alias by which to refer to this table. Default is null.
     */
    from(name: string | BaseBuilder, alias?: string): this;
}

export class FromTableBlock extends AbstractTableBlock implements FromTableMixin {
    constructor(options: Options) {
        super(
            _extend({}, options, {
                prefix: 'FROM',
            })
        );
    }

    from(table: string | BaseBuilder, alias: string = null) {
        this._table(table, alias);

        return this;
    }
}
