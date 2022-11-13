import {
    StringBlock,
    IntoTableBlock,
    MssqlInsertFieldValueBlock,
    InsertFieldsFromQueryBlock,
    MssqlInsertFieldValueMixin,
} from '../../block';
import { QueryBuilder } from '../../query-builder';
import { Insert } from '../insert';

export interface MssqlInsert extends Insert, MssqlInsertFieldValueMixin {}

export class MssqlInsert extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'INSERT'),
            new IntoTableBlock(options),
            new MssqlInsertFieldValueBlock(options),
            new InsertFieldsFromQueryBlock(options),
        ];

        super(options, blocks);
    }
}
