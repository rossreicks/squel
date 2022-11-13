import {
    StringBlock,
    FunctionBlock,
    GetFieldBlock,
    FromTableBlock,
    JoinBlock,
    WhereBlock,
    GroupByBlock,
    HavingBlock,
    OrderByBlock,
    LimitBlock,
    OffsetBlock,
    UnionBlock,
    WithBlock,
    DistinctOnBlock,
    WithMixin,
    DistinctOnMixin,
    FromTableMixin,
    FunctionMixin,
    GetFieldMixin,
    GroupByMixin,
    HavingMixin,
    JoinMixin,
    LimitMixin,
    OffsetMixin,
    OrderByMixin,
    UnionMixin,
    WhereMixin,
} from '../../block';
import { QueryBuilder } from '../../query-builder';

export interface PostgresSelect
    extends QueryBuilder,
        WithMixin,
        FunctionMixin,
        DistinctOnMixin,
        GetFieldMixin,
        FromTableMixin,
        JoinMixin,
        WhereMixin,
        GroupByMixin,
        HavingMixin,
        OrderByMixin,
        LimitMixin,
        OffsetMixin,
        UnionMixin {}

export class PostgresSelect extends QueryBuilder {
    constructor(options, blocks) {
        blocks = blocks || [
            new WithBlock(options),
            new StringBlock(options, 'SELECT'),
            new FunctionBlock(options),
            new DistinctOnBlock(options),
            new GetFieldBlock(options),
            new FromTableBlock(options),
            new JoinBlock(options),
            new WhereBlock(options),
            new GroupByBlock(options),
            new HavingBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
            new OffsetBlock(options),
            new UnionBlock(options),
        ];

        super(options, blocks);
    }
}
