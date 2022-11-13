/* eslint-disable no-loop-func */
/* eslint-disable no-useless-constructor */
import { BaseBuilder } from '../cls';
import { Options } from '../types/options';

/*
 * ---------------------------------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------------------------------
 * Building blocks
 * ---------------------------------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------------------------------
 */

/*
 * A building block represents a single build-step within a query building process.
 *
 * Query builders consist of one or more building blocks which get run in a particular order. Building blocks can
 * optionally specify methods to expose through the query builder interface. They can access all the input data for
 * the query builder and manipulate it as necessary, as well as append to the final query string output.
 *
 * If you wish to customize how queries get built or add proprietary query phrases and content then it is recommended
 * that you do so using one or more custom building blocks.
 *
 * Original idea posted in https://github.com/hiddentao/export/issues/10*issuecomment-15016427
 */
export abstract class Block extends BaseBuilder {
    constructor(options: Options) {
        super(options);
    }

    /**
     * Get input methods to expose within the query builder.
     *
     * By default all methods except the following get returned:
     *   methods prefixed with _
     *   constructor and toString()
     *
     * @return Object key -> function pairs
     */
    exposedMethods() {
        const ret = {};

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let obj = this;

        while (obj) {
            Object.getOwnPropertyNames(obj).forEach((prop) => {
                if (
                    prop !== 'constructor' &&
                    typeof obj[prop] === 'function' &&
                    prop.charAt(0) !== '_' &&
                    !Block.prototype[prop]
                ) {
                    ret[prop] = obj[prop];
                }
            });

            obj = Object.getPrototypeOf(obj);
        }

        return ret;
    }
}
