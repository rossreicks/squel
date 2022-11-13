import { Block } from './block';
import { Squel } from './cls';
import { DefaultQueryBuilderOptions } from './base-builder';
import { PostgresDelete } from './methods/postgres/postgres-delete';
import { PostgresInsert } from './methods/postgres/postgres-insert';
import { PostgresSelect } from './methods/postgres/postgres-select';
import { PostgresUpdate } from './methods/postgres/postgres-update';
import { Options } from './types/options';

export class PostgreSQL extends Squel {
    static flavor = 'postgres';

    static defaultOptions: Options = {
        ...DefaultQueryBuilderOptions,
        autoQuoteAliasNames: false,
        numberedParameters: true,
        numberedParametersStartAt: 1,
        useAsForTableAliasNames: true,
    };

    static select(options: Options = PostgreSQL.defaultOptions, blocks: Block[] = null) {
        return new PostgresSelect(options, blocks);
    }

    static insert(options: Options = PostgreSQL.defaultOptions, blocks: Block[] = null) {
        return new PostgresInsert(options, blocks);
    }

    static update(options: Options = PostgreSQL.defaultOptions, blocks: Block[] = null) {
        return new PostgresUpdate(options, blocks);
    }

    static delete(options: Options = PostgreSQL.defaultOptions, blocks: Block[] = null) {
        return new PostgresDelete(options, blocks);
    }
}
