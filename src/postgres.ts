import { Block } from './block';
import { DefaultQueryBuilderOptions } from './base-builder';
import { PostgresDelete } from './methods/postgres/postgres-delete';
import { PostgresInsert } from './methods/postgres/postgres-insert';
import { PostgresSelect } from './methods/postgres/postgres-select';
import { PostgresUpdate } from './methods/postgres/postgres-update';
import { Options } from './types/options';
import { Squel } from './cls';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PostgreSQL {
    export const flavor = 'postgres';

    export const defaultOptions: Options = {
        ...DefaultQueryBuilderOptions,
        autoQuoteAliasNames: false,
        numberedParameters: true,
        numberedParametersStartAt: 1,
        useAsForTableAliasNames: true,
    };

    export function select(options: Options = PostgreSQL.defaultOptions, blocks: Block[] = null) {
        return new PostgresSelect(options, blocks);
    }

    export function insert(options: Options = PostgreSQL.defaultOptions, blocks: Block[] = null) {
        return new PostgresInsert(options, blocks);
    }

    export function update(options: Options = PostgreSQL.defaultOptions, blocks: Block[] = null) {
        return new PostgresUpdate(options, blocks);
    }

    export function _delete(options: Options = PostgreSQL.defaultOptions, blocks: Block[] = null) {
        return new PostgresDelete(options, blocks);
    }

    export const str = Squel.str;
    export const remove = _delete;
}

PostgreSQL['delete'] = PostgreSQL._delete;
