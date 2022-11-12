import { Block } from './block';
import { Options } from '../types/options';

export abstract class AbstractVerbSingleValueBlock extends Block {
    private _value: string | number;

    /**
     * @param options.verb The prefix verb string.
     */
    constructor(options) {
        super(options);

        this._value = null;
    }

    _setValue(value) {
        this._value = value !== null ? this._sanitizeLimitOffset(value) : value;
    }

    _toParamString(options: Options = {}) {
        const expr = this._value !== null ? `${this.options.verb} ${this.options.parameterCharacter}` : '';

        const values = this._value !== null ? [this._value] : [];

        return this._buildString(expr, values, options);
    }
}
