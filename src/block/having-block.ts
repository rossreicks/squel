import { AbstractConditionBlock } from "./abstract-condition-block";
import { BaseBuilder } from "../base-builder";
import { Options } from "../types/options";
import { _extend } from "../helpers";

export class HavingBlock extends AbstractConditionBlock {
    constructor(options: Options) {
        super(
            _extend({}, options, {
                verb: "HAVING",
            })
        );
    }

    having(condition: string | BaseBuilder, ...values) {
        this._condition(condition, ...values);
    }
}
