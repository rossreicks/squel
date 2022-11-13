import { Expression, MySQL } from './cls';
import { Case } from './case';
import { Select } from './methods/select';
import { Update } from './methods/update';
import { Insert } from './methods/insert';
import { Delete } from './methods/delete';
import { FunctionBlock } from './block';
import { registerValueHandler as registerValueHandlerHelper } from './helpers';
export class Squel {
    static flavour = null;

    static globalValueHandlers = [
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

    static expr(options) {
        return new Expression(options);
    }

    static case(name, options) {
        return new Case(name, options);
    }

    static select(options, blocks) {
        return new Select(options, blocks);
    }

    static update(options, blocks) {
        return new Update(options, blocks);
    }

    static insert(options, blocks) {
        return new Insert(options, blocks);
    }

    static delete(options, blocks) {
        return new Delete(options, blocks);
    }

    static str(...args: any[]) {
        const inst = new FunctionBlock({});

        inst.function(args[0] as string, ...args.slice(1));

        return inst;
    }

    static rstr(...args) {
        const inst = new FunctionBlock({
            rawNesting: true,
        });

        inst.function(args[0] as string, ...args.slice(1));

        return inst;
    }

    // Setup Squel for a particular SQL flavour
    static useFlavour(_flavour: 'mysql'): MySQL {
        return MySQL;
    }

    // aliases
    static remove = this.delete;
}
