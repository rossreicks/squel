import { Block, FunctionBlock } from './block';
import { Squel } from './cls';
import { DefaultQueryBuilderOptions } from './base-builder';
import { Options } from './types/options';
import { MssqlSelect } from './methods/mssql/mssql-select';
import { MssqlInsert } from './methods/mssql/mssql-insert';
import { MssqlUpdate } from './methods/mssql/mssql-update';
import { MssqlDelete } from './methods/mssql/mssql-delete';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MSSql {
    export const flavor = 'mssql';

    export const globalValueHandlers = [
        {
            type: FunctionBlock,
            handler: (value, asParam = false) => (asParam ? value.toParam() : value.toString()),
        },
        {
            type: Date,
            handler: (date) =>
                `'${date.getUTCFullYear()}-${
                    date.getUTCMonth() + 1
                }-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}'`,
        },
    ];

    export const defaultOptions: Options = {
        ...DefaultQueryBuilderOptions,
        replaceSingleQuotes: true,
        autoQuoteAliasNames: false,
        numberedParametersPrefix: '@',
    };

    export function select(options: Options = MSSql.defaultOptions, blocks: Block[] = null) {
        return new MssqlSelect(options, blocks);
    }

    export function insert(options: Options = MSSql.defaultOptions, blocks: Block[] = null) {
        return new MssqlInsert(options, blocks);
    }

    export function update(options: Options = MSSql.defaultOptions, blocks: Block[] = null) {
        return new MssqlUpdate(options, blocks);
    }

    export function _delete(options: Options = MSSql.defaultOptions, blocks: Block[] = null) {
        return new MssqlDelete(options, blocks);
    }

    export const str = Squel.str;
}

MSSql['delete'] = MSSql._delete;
