import { QueryBuilder } from '../query-builder';
import {
    FunctionBlock,
    StringBlock,
    DistinctBlock,
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
} from '../block';
import { DistinctMixin } from '../block/distinct-block';
import { FromTableMixin } from '../block/from-table-block';
import { FunctionMixin } from '../block/function-block';
import { GetFieldMixin } from '../block/get-field-block';
import { GroupByMixin } from '../block/group-by-block';
import { HavingMixin } from '../block/having-block';
import { JoinMixin } from '../block/join-block';
import { LimitMixin } from '../block/limit-block';
import { OffsetMixin } from '../block/offset-block';
import { OrderByMixin } from '../block/order-by-block';
import { UnionMixin } from '../block/union-block';
import { WhereMixin } from '../block/where-block';

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
