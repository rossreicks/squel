import { Options } from '../types/options';
import { Block } from './block';

// A function string block
export class FunctionBlock extends Block {
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
    }

    _toParamString(options: Options = {}) {
        return this._buildManyStrings(this._strings, this._values, options);
    }
}
