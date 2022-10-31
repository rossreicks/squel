/* eslint-disable no-param-reassign */
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

// SELECT query builder.
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
