import {
    StringBlock,
    DistinctBlock,
    GetFieldBlock,
    FromTableBlock,
    JoinBlock,
    WhereBlock,
    GroupByBlock,
    OrderByBlock,
    UnionBlock,
    LimitOffsetTopBlock,
    MssqlLimitOffsetTopBlock,
} from '../../block';
import { QueryBuilder } from '../../query-builder';
import { Select } from '../select';

export interface MssqlSelect
    extends Select,
        MssqlLimitOffsetTopBlock.TopMixin,
        MssqlLimitOffsetTopBlock.LimitMixin,
        MssqlLimitOffsetTopBlock.OffsetMixin {}

export class MssqlSelect extends QueryBuilder {
    constructor(options, blocks = null) {
        const limitOffsetTopBlock = new LimitOffsetTopBlock(options);

        blocks = blocks || [
            new StringBlock(options, 'SELECT'),
            new DistinctBlock(options),
            limitOffsetTopBlock.TOP(),
            new GetFieldBlock(options),
            new FromTableBlock(options),
            new JoinBlock(options),
            new WhereBlock(options),
            new GroupByBlock(options),
            new OrderByBlock(options),
            limitOffsetTopBlock.OFFSET(),
            limitOffsetTopBlock.LIMIT(),
            new UnionBlock(options),
        ];

        super(options, blocks);
    }
}
