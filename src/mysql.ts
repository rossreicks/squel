import { Block } from './block';
import { Replace } from './methods/replace';
import { Squel } from './cls';
import { Options } from './types/options';
import { MysqlInsert } from './methods/mysql-insert';

export class MySQL extends Squel {
    static flavor = 'mysql';

    static replace(options: Options, blocks: Block[] = null) {
        return new Replace(options, blocks);
    }

    static insert(options: Options, blocks: Block[] = null) {
        return new MysqlInsert(options, blocks);
    }
}
