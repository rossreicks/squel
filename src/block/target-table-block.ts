import { AbstractTableBlock } from './abstract-table-block';

export interface TargetTableMixin {
    /**
     * The actual target table whose data is to be deleted. Used in conjunction with `from()`.
     *
     * @param table Name of table.
     */
    target(table: string): this;
}

/**
 * * target table for DELETE queries, DELETE <??> FROM
 */
export class TargetTableBlock extends AbstractTableBlock implements TargetTableMixin {
    target(table: string) {
        this._table(table);

        return this;
    }
}
