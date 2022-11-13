import { QueryBuilder } from '../query-builder';
import { Options } from '../types/options';
import { Block } from './block';

export interface WithMixin {
    /**
     * Combine with another query using a Common Table Expression (CTE), ie a `WITH` clause
     *
     * @param alias The alias that the table expression should use
     * @param table Another query to include as a Common Table Expression
     */
    with(alias: string, table: QueryBuilder): this;
}

export class WithBlock extends Block implements WithMixin {
    _tables: { alias: string; table: QueryBuilder }[];

    constructor(options: Options) {
        super(options);
        this._tables = [];
    }

    with(alias: string, table: QueryBuilder) {
        this._tables.push({ alias, table });

        return this;
    }

    _toParamString(options: Options = {}) {
        const parts = [];
        const values = [];

        for (const { alias, table } of this._tables) {
            const ret = table._toParamString({
                buildParameterized: options.buildParameterized,
                nested: true,
            });

            parts.push(`${alias} AS ${ret.text}`);
            ret.values.forEach((value) => values.push(value));
        }

        return {
            text: parts.length ? `WITH ${parts.join(', ')}` : '',
            values,
        };
    }
}
