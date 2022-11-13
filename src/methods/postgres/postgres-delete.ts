import {
    WithBlock,
    StringBlock,
    FromTableBlock,
    WhereBlock,
    OrderByBlock,
    LimitBlock,
    ReturningBlock,
    WithMixin,
    FromTableMixin,
    WhereMixin,
    LimitMixin,
    OrderByMixin,
    ReturningMixin,
    TargetTableMixin,
    JoinMixin,
    JoinBlock,
    TargetTableBlock,
} from '../../block';
import { _extend } from '../../helpers';
import { QueryBuilder } from '../../query-builder';

export interface PostgresDelete
    extends QueryBuilder,
        WithMixin,
        TargetTableMixin,
        FromTableMixin,
        JoinMixin,
        WhereMixin,
        ReturningMixin,
        OrderByMixin,
        LimitMixin {}

export class PostgresDelete extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new WithBlock(options),
            new StringBlock(options, 'DELETE'),
            new TargetTableBlock(options),
            new FromTableBlock(
                _extend({}, options, {
                    singleTable: true,
                })
            ),
            new JoinBlock(options),
            new WhereBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
            new ReturningBlock(options),
        ];

        super(options, blocks);
    }
}
