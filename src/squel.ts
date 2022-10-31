/* eslint-disable class-methods-use-this */
import { Expression } from "./expression";
import { Case } from "./case";
import { Select } from "./methods/select";
import { Update } from "./methods/update";
import { Insert } from "./methods/insert";
import { Delete } from "./methods/delete";
import { FunctionBlock } from "./block";
import { registerValueHandler } from "./helpers";

export class Squel {
    flavour = null;

    flavours = {};

    VERSION = "<<VERSION_STRING>>";

    constructor(flavour?: string) {
        this.flavour = flavour;
    }

    expr(options) {
        return new Expression(options);
    }

    case(name, options) {
        return new Case(name, options);
    }

    select(options, blocks) {
        return new Select(options, blocks);
    }

    update(options, blocks) {
        return new Update(options, blocks);
    }

    insert(options, blocks) {
        return new Insert(options, blocks);
    }

    delete(options, blocks) {
        return new Delete(options, blocks);
    }

    str(...args: any[]) {
        const inst = new FunctionBlock({});

        inst.function(args[0] as string, ...args.slice(1));

        return inst;
    }

    // TODO - help!
    // rstr(...args) {
    //     const inst = new FunctionBlock({
    //         rawNesting: true,
    //     });

    //     inst.function(...getArr(...args));

    //     return inst;
    // }

    // Setup Squel for a particular SQL flavour
    useFlavour = function (flavour = null) {
        if (!flavour) {
            return this;
        }

        if (this.flavours[flavour] instanceof Function) {
            const s = this(flavour);

            this.flavours[flavour].call(null, s);

            // add in flavour methods
            s.flavours = this.flavours;
            s.useFlavour = this.useFlavour;

            return s;
        }

        throw new Error(`Flavour not available: ${flavour}`);
    };

    // aliases
    remove = this.delete;
}
