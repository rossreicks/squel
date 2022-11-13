import { Block, StringBlock, IntoTableBlock, InsertFieldValueBlock, InsertFieldsFromQueryBlock } from '../block';
import { QueryBuilder } from '../query-builder';
import { Options } from '../types/options';

export class Replace extends QueryBuilder {
    constructor(options: Options, blocks: Block[] = null) {
        blocks = blocks || [
            new StringBlock(options, 'REPLACE'),
            new IntoTableBlock(options),
            new InsertFieldValueBlock(options),
            new InsertFieldsFromQueryBlock(options),
        ];

        super(options, blocks);
    }
}
