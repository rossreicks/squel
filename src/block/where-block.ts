import { AbstractConditionBlock } from "./abstract-condition-block";
import { BaseBuilder } from "../base-builder";
import { Options } from "../types/options";
import { _extend } from "../helpers";

export class WhereBlock extends AbstractConditionBlock {
    constructor(options: Options) {
        super(
            _extend({}, options, {
                verb: "WHERE",
            })
        );
    }

    where(condition: string | BaseBuilder, ...values) {
        this._condition(condition, ...values);
    }
}
