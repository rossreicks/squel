import {
    WithBlock,
    StringBlock,
    FromTableBlock,
    WhereBlock,
    OrderByBlock,
    LimitBlock,
    ReturningBlock,
    FromTableMixin,
    LimitMixin,
    OrderByMixin,
    ReturningMixin,
    WhereMixin,
    WithMixin,
    SetFieldBlock,
    UpdateTableBlock,
    UpdateTableMixin,
    SetFieldMixin,
} from '../../block';
import { QueryBuilder } from '../../query-builder';

export interface PostgresUpdate
    extends QueryBuilder,
        WithMixin,
        UpdateTableMixin,
        SetFieldMixin,
        FromTableMixin,
        WhereMixin,
        ReturningMixin,
        OrderByMixin,
        LimitMixin {}

export class PostgresUpdate extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new WithBlock(options),
            new StringBlock(options, 'UPDATE'),
            new UpdateTableBlock(options),
            new SetFieldBlock(options),
            new FromTableBlock(options),
            new WhereBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
            new ReturningBlock(options),
        ];

        super(options, blocks);
    }
}
