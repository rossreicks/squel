import { QueryBuilder } from '../query-builder';
import { LimitBlock, LimitMixin, OrderByBlock, OrderByMixin, StringBlock, WhereBlock, WhereMixin } from '../block';
import { SetFieldBlock, SetFieldMixin } from '../block/set-field-block';
import { UpdateTableBlock, UpdateTableMixin } from '../block/update-table-block';

export interface Update extends QueryBuilder, UpdateTableMixin, SetFieldMixin, WhereMixin, OrderByMixin, LimitMixin {}

export class Update extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'UPDATE'),
            new UpdateTableBlock(options),
            new SetFieldBlock(options),
            new WhereBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
        ];

        super(options, blocks);
    }
}
