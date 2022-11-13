import {
    InsertFieldsFromQueryBlock,
    InsertFieldsFromQueryMixin,
    InsertFieldValueBlock,
    InsertFieldValueMixin,
    IntoTableBlock,
    IntoTableMixin,
    OnConflictKeyUpdateBlock,
    OnConflictKeyUpdateMixin,
    ReturningBlock,
    ReturningMixin,
    StringBlock,
    WithBlock,
    WithMixin,
} from '../../block';
import { QueryBuilder } from '../../query-builder';

export interface PostgresInsert
    extends QueryBuilder,
        WithMixin,
        IntoTableMixin,
        InsertFieldValueMixin,
        InsertFieldsFromQueryMixin,
        ReturningMixin,
        OnConflictKeyUpdateMixin {}

export class PostgresInsert extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new WithBlock(options),
            new StringBlock(options, 'INSERT'),
            new IntoTableBlock(options),
            new InsertFieldValueBlock(options),
            new InsertFieldsFromQueryBlock(options),
            new OnConflictKeyUpdateBlock(options),
            new ReturningBlock(options),
        ];

        super(options, blocks);
    }
}
