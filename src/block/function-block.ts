import { Options } from '../types/options';
import { Block } from './block';

export interface FunctionMixin {
    /**
     * Insert a function value, see [[FunctionBlock]].
     */
    function(str: string, ...value: any[]): this;
}

/**
 * A function string block
 */
export class FunctionBlock extends Block implements FunctionMixin {
    _strings: string[];
    _values: any[][];

    constructor(options: Options) {
        super(options);

        this._strings = [];
        this._values = [];
    }

    function(str: string, ...values) {
        this._strings.push(str);
        this._values.push(values);

        return this;
    }

    _toParamString(options: Options = {}) {
        return this._buildManyStrings(this._strings, this._values, options);
    }
}
