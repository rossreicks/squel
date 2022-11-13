import { MssqlUpdateDeleteOutputMixin } from '../../../dist/squel';
import {
    FromTableBlock,
    JoinBlock,
    LimitBlock,
    OrderByBlock,
    StringBlock,
    TargetTableBlock,
    UpdateDeleteOutputBlock,
    WhereBlock,
} from '../../block';
import { _extend } from '../../helpers';
import { QueryBuilder } from '../../query-builder';
import { Delete } from '../delete';

export interface MssqlDelete extends Delete, MssqlUpdateDeleteOutputMixin {}

export class MssqlDelete extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'DELETE'),
            new TargetTableBlock(options),
            new FromTableBlock(_extend({}, options, { singleTable: true })),
            new JoinBlock(options),
            new UpdateDeleteOutputBlock(_extend({}, options, { forDelete: true })),
            new WhereBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
        ];

        super(options, blocks);
    }
}
