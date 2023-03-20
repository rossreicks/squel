import { Expression, MySQL, MSSql, PostgreSQL } from './cls';
import { Case } from './case';
import { Select } from './methods/select';
import { Update } from './methods/update';
import { Insert } from './methods/insert';
import { Delete } from './methods/delete';
import { Block, FunctionBlock } from './block';
import { registerValueHandler as registerValueHandlerHelper } from './helpers';
import { ValueHandler } from './types/value-handler';
import { Options } from './types/options';

export class Squel {
    static flavour = null;

    static globalValueHandlers: ValueHandler<any>[] = [
        {
            type: FunctionBlock,
            handler: (value, asParam = false) => (asParam ? value.toParam() : value.toString()),
        },
    ];

    // THIS WILL BE REPLACED AT BUILD TIME WITH THE PACKAGE.JSON VERSION
    static VERSION = '[VI]{version}[/VI]';

    static registerValueHandler(type, handler) {
        registerValueHandlerHelper(Squel.globalValueHandlers, type, handler);
    }

    static expr(options?: Options) {
        return new Expression(options);
    }

    static case(name, options?: Options) {
        return new Case(name, options);
    }

    static select(options?: Options, blocks?: Block[]) {
        return new Select(options, blocks);
    }

    static update(options?: Options, blocks?: Block[]) {
        return new Update(options, blocks);
    }

    static insert(options?: Options, blocks?: Block[]) {
        return new Insert(options, blocks);
    }

    static delete(options?: Options, blocks?: Block[]) {
        return new Delete(options, blocks);
    }

    static str(...args: any[]) {
        const inst = new FunctionBlock({});

        inst.function(args[0] as string, ...args.slice(1));

        return inst;
    }

    static rstr(...args: any[]) {
        const inst = new FunctionBlock({
            rawNesting: true,
        });

        inst.function(args[0] as string, ...args.slice(1));

        return inst;
    }

    // Setup Squel for a particular SQL flavour
    static useFlavour<T extends 'mysql' | 'postgres' | 'mssql'>(
        _flavour: T
    ): T extends 'mysql' ? MySQL : T extends 'postgres' ? PostgreSQL : T extends 'mssql' ? MSSql : never {
        if (_flavour === 'mysql') {
            this.globalValueHandlers = [
                {
                    type: FunctionBlock,
                    handler: (value, asParam = false) => (asParam ? value.toParam() : value.toString()),
                },
            ];

            return MySQL as any;
        }

        if (_flavour === 'postgres') {
            this.globalValueHandlers = [
                {
                    type: FunctionBlock,
                    handler: (value, asParam = false) => (asParam ? value.toParam() : value.toString()),
                },
            ];

            return PostgreSQL as any;
        }

        if (_flavour === 'mssql') {
            this.globalValueHandlers = MSSql.globalValueHandlers;

            return MSSql as any;
        }

        throw new Error(`Unknown flavour: ${_flavour}`);
    }

    // aliases
    static remove = this.delete;
}
