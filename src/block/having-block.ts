import { AbstractConditionBlock } from './abstract-condition-block';
import { Expression } from '../expression';
import { Options } from '../types/options';
import { _extend } from '../helpers';

export interface HavingMixin {
    /**
     * Add a HAVING condition.
     *
     * @param condition The condition expression.
     * @param args Additional arguments for parameter substitution. See guide for examples. Default
     *             is `null`.
     */
    having(condition: string | Expression, ...args: any[]): this;
}

export class HavingBlock extends AbstractConditionBlock implements HavingMixin {
    constructor(options: Options) {
        super(
            _extend({}, options, {
                verb: 'HAVING',
            })
        );
    }

    having(condition: string | Expression, ...values) {
        this._condition(condition, ...values);

        return this;
    }
}
