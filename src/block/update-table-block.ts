import { Options } from '../types/options';
import { AbstractTableBlock } from './abstract-table-block';

export interface UpdateTableMixin {
    /**
     * A table to update.
     *
     * @param name Name of table.
     * @param alias An alias by which to refer to this table. Default is `null`.
     */
    table(name: string, alias?: string): this;
}

export class UpdateTableBlock extends AbstractTableBlock implements UpdateTableMixin {
    table(table: string, alias: string = null) {
        this._table(table, alias);

        return this;
    }

    _toParamString(options: Options = {}) {
        if (!this._hasTable()) {
            throw new Error('table() needs to be called');
        }

        return super._toParamString(options);
    }
}
