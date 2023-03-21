/* eslint-disable @typescript-eslint/no-namespace */
import { Expression, MySQL, MSSql, PostgreSQL } from './cls';
import { Case } from './case';
import type { Case as CaseType } from './case';
import { Select } from './methods/select';
import type { Select as SelectType } from './methods/select';
import { Update } from './methods/update';
import type { Update as UpdateType } from './methods/update';
import { Insert } from './methods/insert';
import type { Insert as InsertType } from './methods/insert';
import { Delete } from './methods/delete';
import type { Delete as DeleteType } from './methods/delete';
import { Block, FunctionBlock } from './block';
import { registerValueHandler as registerValueHandlerHelper } from './helpers';
import { ValueHandler } from './types/value-handler';
import { Options } from './types/options';

namespace Squel {
    export const flavour = null;

    export const globalValueHandlers: ValueHandler<any>[] = [
        {
            type: FunctionBlock,
            handler: (value, asParam = false) => (asParam ? value.toParam() : value.toString()),
        },
    ];

    // THIS WILL BE REPLACED AT BUILD TIME WITH THE PACKAGE.JSON VERSION
    export const VERSION = '[VI]{version}[/VI]';

    export function registerValueHandler(type, handler) {
        registerValueHandlerHelper(Squel.globalValueHandlers, type, handler);
    }

    export function expr(options?: Options) {
        return new Expression(options);
    }

    export function _case(name, options?: Options) {
        return new Case(name, options);
    }

    export function select(options?: Options, blocks?: Block[]) {
        return new Select(options, blocks);
    }

    export function update(options?: Options, blocks?: Block[]) {
        return new Update(options, blocks);
    }

    export function insert(options?: Options, blocks?: Block[]) {
        return new Insert(options, blocks);
    }

    export function _delete(options?: Options, blocks?: Block[]) {
        return new Delete(options, blocks);
    }

    export function str(...args: any[]) {
        const inst = new FunctionBlock({});

        inst.function(args[0] as string, ...args.slice(1));

        return inst;
    }

    export function rstr(...args: any[]) {
        const inst = new FunctionBlock({
            rawNesting: true,
        });

        inst.function(args[0] as string, ...args.slice(1));

        return inst;
    }

    // Setup Squel for a particular SQL flavour
    export function useFlavour<T extends 'mysql' | 'postgres' | 'mssql'>(_flavour: T) {
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
    export const remove = _delete;

    export type Select = SelectType;
    export type Update = UpdateType;
    export type Insert = InsertType;
    export type Delete = DeleteType;
    export type Case = CaseType;
}

Squel['case'] = Squel._case;
Squel['delete'] = Squel._delete;

export default Squel;
