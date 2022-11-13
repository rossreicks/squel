import { Block, FunctionBlock } from './block';
import { Squel } from './cls';
import { DefaultQueryBuilderOptions } from './base-builder';
import { Options } from './types/options';
import { MssqlSelect } from './methods/mssql/mssql-select';
import { MssqlInsert } from './methods/mssql/mssql-insert';
import { MssqlUpdate } from './methods/mssql/mssql-update';
import { MssqlDelete } from './methods/mssql/mssql-delete';

export class MSSql extends Squel {
    static flavor = 'mssql';

    static globalValueHandlers = [
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

    static defaultOptions: Options = {
        ...DefaultQueryBuilderOptions,
        replaceSingleQuotes: true,
        autoQuoteAliasNames: false,
        numberedParametersPrefix: '@',
    };

    static select(options: Options = MSSql.defaultOptions, blocks: Block[] = null) {
        return new MssqlSelect(options, blocks);
    }

    static insert(options: Options = MSSql.defaultOptions, blocks: Block[] = null) {
        return new MssqlInsert(options, blocks);
    }

    static update(options: Options = MSSql.defaultOptions, blocks: Block[] = null) {
        return new MssqlUpdate(options, blocks);
    }

    static delete(options: Options = MSSql.defaultOptions, blocks: Block[] = null) {
        return new MssqlDelete(options, blocks);
    }
}
