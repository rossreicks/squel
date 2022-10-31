/* eslint-disable no-param-reassign */
import { QueryBuilder } from "../query-builder";
import {
    StringBlock,
    TargetTableBlock,
    FromTableBlock,
    JoinBlock,
    WhereBlock,
    OrderByBlock,
    LimitBlock,
} from "../block";
import { _extend } from "../helpers";

export class Delete extends QueryBuilder {
    constructor(options, blocks = null) {
        blocks = blocks || [
            new StringBlock(options, "DELETE"),
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
        ];

        super(options, blocks);
    }
}
