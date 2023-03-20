import { QueryBuilder } from '../query-builder';
import {
    Block,
    StringBlock,
    IntoTableBlock,
    InsertFieldValueBlock,
    InsertFieldsFromQueryBlock,
    InsertFieldsFromQueryMixin,
    InsertFieldValueMixin,
    IntoTableMixin,
} from '../block';
import { Options } from '../types/options';

export interface Insert extends QueryBuilder, IntoTableMixin, InsertFieldValueMixin, InsertFieldsFromQueryMixin {}

export class Insert extends QueryBuilder {
    constructor(options?: Options, blocks: Block[] = null) {
        blocks = blocks || [
            new StringBlock(options, 'INSERT'),
            new IntoTableBlock(options),
            new InsertFieldValueBlock(options),
            new InsertFieldsFromQueryBlock(options),
        ];

        super(options, blocks);
    }
}
