/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
/*
Copyright (c) Ramesh Nair (hiddentao.com)

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

let squel = undefined;
const { _, testCreator, assert, expect, should } = require("./testbase");
const test = testCreator();

describe("MySQL flavour", () => {
   beforeEach(() => {
        delete require.cache[require.resolve("../dist/squel")];
        squel = require("../dist/squel");
        return (squel = squel.useFlavour("mysql"));
    });

    describe('MysqlOnDuplicateKeyUpdateBlock', () => {
       beforeEach(() => {
            this.cls = squel.cls.MysqlOnDuplicateKeyUpdateBlock;
            return (this.inst = new this.cls());
        });

       it("instanceof of AbstractSetFieldBlock", () => {
            return assert.instanceOf(
                this.inst,
                squel.cls.AbstractSetFieldBlock
            );
        });

       describe("onDupUpdate()", () => {
           it("calls to _set()", () => {
                const spy = test.mocker.stub(this.inst, "_set");

                this.inst.onDupUpdate("f", "v", { dummy: true });

                return assert.ok(
                    spy.calledWithExactly("f", "v", { dummy: true })
                );
            });
        });

       describe("_toParamString()", () => {
           beforeEach(() => {
                this.inst.onDupUpdate("field1 = field1 + 1");
                this.inst.onDupUpdate("field2", "value2", { dummy: true });
                return this.inst.onDupUpdate("field3", "value3");
            });

           it("non-parameterized", () => {
                return assert.same(this.inst._toParamString(), {
                    text: "ON DUPLICATE KEY UPDATE field1 = field1 + 1, field2 = 'value2', field3 = 'value3'",
                    values: [],
                });
            });
            it('parameterized()', () => {
                return assert.same(
                    this.inst._toParamString({ buildParameterized: true }),
                    {
                        text: "ON DUPLICATE KEY UPDATE field1 = field1 + 1, field2 = ?, field3 = ?",
                        values: ["value2", "value3"],
                    }
                );
            });
        });
    });

   describe("INSERT builder", () => {
       beforeEach(() => {
            return (this.inst = squel.insert());
        });

        describe('>> into(table).set(field, 1).set(field1, 2).onDupUpdate(field, 5).onDupUpdate(field1, "str")', () => {

               beforeEach(() => {
                    return this.inst
                        .into("table")
                        .set("field", 1)
                        .set("field1", 2)
                        .onDupUpdate("field", 5)
                        .onDupUpdate("field1", "str");
                });
               it('toString', () => {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field, field1) VALUES (1, 2) ON DUPLICATE KEY UPDATE field = 5, field1 = 'str'"
                    );
                });

               it('toParam', () => {
                    return assert.same(this.inst.toParam(), {
                        text: "INSERT INTO table (field, field1) VALUES (?, ?) ON DUPLICATE KEY UPDATE field = ?, field1 = ?",
                        values: [1, 2, 5, "str"],
                    });
                });
        });

        describe('>> into(table).set(field2, 3).onDupUpdate(field2, "str", { dontQuote: true })', () => {
               beforeEach(() => {
                    return this.inst
                        .into("table")
                        .set("field2", 3)
                        .onDupUpdate("field2", "str", { dontQuote: true });
                });
               it('toString', () => {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field2) VALUES (3) ON DUPLICATE KEY UPDATE field2 = str"
                    );
                });
               it('toParam', () => {
                    return assert.same(this.inst.toParam(), {
                        text: "INSERT INTO table (field2) VALUES (?) ON DUPLICATE KEY UPDATE field2 = ?",
                        values: [3, "str"],
                    });
                });
        });
    });

   describe("REPLACE builder", () => {
       beforeEach(() => {
            return (this.inst = squel.replace());
        });

       describe(">> into(table).set(field, 1).set(field1, 2)", () => {
           beforeEach(() => {
                return this.inst.into("table").set("field", 1).set("field1", 2);
            });
           it('toString', () => {
                return assert.same(
                    this.inst.toString(),
                    "REPLACE INTO table (field, field1) VALUES (1, 2)"
                );
            });

           it('toParam', () => {
                return assert.same(this.inst.toParam(), {
                    text: "REPLACE INTO table (field, field1) VALUES (?, ?)",
                    values: [1, 2],
                });
            });
        });
    });
});

