import { AbstractTableBlock } from './abstract-table-block';
import { BaseBuilder } from '../base-builder';
import { Options } from '../types/options';
import { _extend } from '../helpers';

export class FromTableBlock extends AbstractTableBlock {
    constructor(options: Options) {
        super(
            _extend({}, options, {
                prefix: 'FROM',
            })
        );
    }

    from(table: BaseBuilder, alias = null) {
        this._table(table, alias);
    }
}
