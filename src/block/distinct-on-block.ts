import { Options } from '../types/options';
import { Block } from './block';

export interface DistinctOnMixin {
    /**
     * Insert the DISTINCT keyword.
     *
     * @param fields One or more field names to use. If passed, this will insert a `DISTINCT ON` clause.
     *               Default is `undefined`.
     */
    distinct(...fields: string[]): this;
}

export class DistinctOnBlock extends Block implements DistinctOnMixin {
    _useDistinct?: boolean;
    _distinctFields: string[];

    constructor(options: Options) {
        super(options);

        this._distinctFields = [];
    }

    distinct(...fields: string[]) {
        this._useDistinct = true;

        // Add all fields to the DISTINCT ON clause.
        fields.forEach((field) => {
            this._distinctFields.push(this._sanitizeField(field));
        });

        return this;
    }

    _toParamString() {
        let text = '';

        if (this._useDistinct) {
            text = 'DISTINCT';

            if (this._distinctFields.length) {
                text += ` ON (${this._distinctFields.join(', ')})`;
            }
        }

        return {
            text,
            values: [],
        };
    }
}
