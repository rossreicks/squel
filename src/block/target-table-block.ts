import { BaseBuilder } from '../base-builder';
import { AbstractTableBlock } from './abstract-table-block';

/**
 * * target table for DELETE queries, DELETE <??> FROM
 */
export class TargetTableBlock extends AbstractTableBlock {
    target(table: BaseBuilder) {
        this._table(table);
    }
}
