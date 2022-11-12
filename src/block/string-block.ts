import { Options } from '../types/options';
import { Block } from './block';

// A fixed string which always gets output
export class StringBlock extends Block {
    _str: string;

    constructor(options: Options, str: string) {
        super(options);

        this._str = str;
    }

    _toParamString(options = {}) {
        return {
            text: this._str,
            values: [],
        };
    }
}
