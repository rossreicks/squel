import { QueryBuilder } from '../query-builder';
import {
    DistinctBlock,
    DistinctMixin,
    FromTableBlock,
    FromTableMixin,
    FunctionBlock,
    FunctionMixin,
    GetFieldBlock,
    GetFieldMixin,
    GroupByBlock,
    GroupByMixin,
    HavingBlock,
    HavingMixin,
    JoinBlock,
    JoinMixin,
    LimitBlock,
    LimitMixin,
    OffsetBlock,
    OffsetMixin,
    OrderByBlock,
    OrderByMixin,
    StringBlock,
    UnionBlock,
    UnionMixin,
    WhereBlock,
    WhereMixin,
} from '../block';

export interface Select
    extends QueryBuilder,
        FunctionMixin,
        DistinctMixin,
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

export class Select extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'SELECT'),
            new FunctionBlock(options),
            new DistinctBlock(options),
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
