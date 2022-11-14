import squel from '../../src';
import { Block, StringBlock } from '../../src/block';
import { QueryBuilder } from '../../src/query-builder';

const areEqual = function (actual, expected, message) {
    return expect(actual).toEqual(expected);
};

describe('Custom queries', () => {
    it('custom query', () => {
        class CommandBlock extends Block {
            command(command, arg) {
                this._command = command;

                return (this._arg = arg);
            }
            compress(level) {
                return this.command('compress', level);
            }
            _toParamString(options) {
                let totalStr = this._command.toUpperCase();
                const totalValues = [];

                if (!options.buildParameterized) {
                    totalStr += ` ${this._arg}`;
                } else {
                    totalStr += ' ?';
                    totalValues.push(this._arg);
                }

                return {
                    text: totalStr,
                    values: totalValues,
                };
            }
        }

        class PragmaQuery extends QueryBuilder {
            constructor(options) {
                const blocks = [new StringBlock(options, 'PRAGMA'), new CommandBlock(options)];

                super(options, blocks);
            }
        }

        // squel method
        squel.pragma = (options) => new PragmaQuery(options);

        const qry = squel.pragma().compress(9);

        areEqual(qry.toString(), 'PRAGMA COMPRESS 9');
        areEqual(qry.toParam(), {
            text: 'PRAGMA COMPRESS ?',
            values: [9],
        });
    });
});
