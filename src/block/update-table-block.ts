import { Options } from '../types/options';
import { AbstractTableBlock } from './abstract-table-block';

export class UpdateTableBlock extends AbstractTableBlock {
    table(table, alias = null) {
        this._table(table, alias);
    }

    _toParamString(options: Options = {}) {
        if (!this._hasTable()) {
            throw new Error('table() needs to be called');
        }

        return super._toParamString(options);
    }
}
