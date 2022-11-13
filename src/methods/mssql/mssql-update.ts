import {
    StringBlock,
    UpdateTableBlock,
    SetFieldBlock,
    WhereBlock,
    UpdateDeleteOutputMixin,
    UpdateTopBlock,
    UpdateDeleteOutputBlock,
} from '../../block';
import { QueryBuilder } from '../../query-builder';
import { Update } from '../update';

export interface MssqlUpdate extends Update, UpdateDeleteOutputMixin {}

export class MssqlUpdate extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'UPDATE'),
            new UpdateTopBlock(options),
            new UpdateTableBlock(options),
            new SetFieldBlock(options),
            new UpdateDeleteOutputBlock(options),
            new WhereBlock(options),
        ];

        super(options, blocks);
    }
}
