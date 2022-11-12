import { AbstractConditionBlock } from './abstract-condition-block';
import { Expression } from '../expression';
import { Options } from '../types/options';
import { _extend } from '../helpers';

export interface WhereMixin {
    /**
     * Add a WHERE condition.
     *
     * @param condition The condition expression.
     * @param args Additional arguments for parameter substitution. See guide for examples. Default is `null`.
     */
    where(condition: string | Expression, ...args: any[]): this;
}

export class WhereBlock extends AbstractConditionBlock implements WhereMixin {
    constructor(options: Options) {
        super(
            _extend({}, options, {
                verb: 'WHERE',
            })
        );
    }

    where(condition: string | Expression, ...values) {
        this._condition(condition, ...values);

        return this;
    }
}
