/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
/*
Copyright (c) 2014 Ramesh Nair (hiddentao.com)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

const squel = require("../dist/squel-basic");

import { assert } from "chai";

assert.same = function (actual, expected, message) {
    return assert.deepEqual(actual, expected, message);
};

describe("Custom queries", () => {
    it("custom query", function () {
        class CommandBlock extends squel.cls.Block {
            command(command, arg) {
                this._command = command;
                return (this._arg = arg);
            }
            compress(level) {
                return this.command("compress", level);
            }
            _toParamString(options) {
                let totalStr = this._command.toUpperCase();
                const totalValues = [];

                if (!options.buildParameterized) {
                    totalStr += ` ${this._arg}`;
                } else {
                    totalStr += " ?";
                    totalValues.push(this._arg);
                }

                return {
                    text: totalStr,
                    values: totalValues,
                };
            }
        }

        class PragmaQuery extends squel.cls.QueryBuilder {
            constructor(options) {
                const blocks = [
                    new squel.cls.StringBlock(options, "PRAGMA"),
                    new CommandBlock(options),
                ];

                super(options, blocks);
            }
        }

        // squel method
        squel.pragma = (options) => new PragmaQuery(options);

        const qry = squel.pragma().compress(9);

        assert.same(qry.toString(), "PRAGMA COMPRESS 9");
        assert.same(qry.toParam(), {
            text: "PRAGMA COMPRESS ?",
            values: [9],
        });
    });
});
