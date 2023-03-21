import { Block } from './block';
import { Replace } from './methods/replace';
import { Squel } from './cls';
import { Options } from './types/options';
import { MysqlInsert } from './methods/mysql/mysql-insert';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MySQL {
    export const flavor = 'mysql';

    export function replace(options: Options, blocks: Block[] = null) {
        return new Replace(options, blocks);
    }

    export function insert(options: Options, blocks: Block[] = null) {
        return new MysqlInsert(options, blocks);
    }

    export const str = Squel.str;
    export const select = Squel.select;
    export const update = Squel.update;
    export const _delete = Squel._delete;
}

MySQL['delete'] = MySQL._delete;
