import {
    InsertFieldsFromQueryBlock,
    InsertFieldsFromQueryMixin,
    InsertFieldValueBlock,
    InsertFieldValueMixin,
    IntoTableBlock,
    IntoTableMixin,
    OnDuplicateKeyUpdateBlock,
    OnDuplicateKeyUpdateMixin,
    StringBlock,
} from '../block';
import { QueryBuilder } from '../query-builder';
import { Insert } from './insert';

export interface MysqlInsert
    extends QueryBuilder,
        IntoTableMixin,
        InsertFieldValueMixin,
        InsertFieldsFromQueryMixin,
        OnDuplicateKeyUpdateMixin {}

export class MysqlInsert extends Insert implements MysqlInsert {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, 'INSERT'),
            new IntoTableBlock(options),
            new InsertFieldValueBlock(options),
            new InsertFieldsFromQueryBlock(options),
            new OnDuplicateKeyUpdateBlock(options),
        ];

        super(options, blocks);
    }
}
