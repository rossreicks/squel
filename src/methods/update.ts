/* eslint-disable no-param-reassign */
import { QueryBuilder } from "../query-builder";
import { LimitBlock, OrderByBlock, StringBlock, WhereBlock } from "../block";
import { SetFieldBlock } from "../block/set-field-block";
import { UpdateTableBlock } from "../block/update-table-block";

export class Update extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, "UPDATE"),
            new UpdateTableBlock(options),
            new SetFieldBlock(options),
            new WhereBlock(options),
            new OrderByBlock(options),
            new LimitBlock(options),
        ];

        super(options, blocks);
    }
}
