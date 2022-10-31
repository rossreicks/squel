/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
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

import sinon from "sinon";
import _ from "underscore";
import { squel } from "../src";
import { StringBlock } from "../src/block";
import { DefaultQueryBuilderOptions } from "../src/base-builder";
import { QueryBuilder } from "../src/query-builder";

import { assert } from "chai";

let mocker;
let inst = squel.delete();

assert.same = function (actual, expected, message) {
    assert.deepEqual(actual, expected, message);
};

describe("DELETE builder", () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
        inst = squel.delete();
    });

    afterEach(() => {
        mocker.restore();
    });

   it("instanceof QueryBuilder", () => {
        assert.instanceOf(inst, QueryBuilder);
    });

    describe('constructor', () => {
       it("override options", () => {
            inst = squel.update({
                usingValuePlaceholders: true,
                dummy: true,
            });

            const expectedOptions = _.extend(
                {},
                DefaultQueryBuilderOptions,
                {
                    usingValuePlaceholders: true,
                    dummy: true,
                }
            );

            Array.from(inst.blocks).map((block) =>
                assert.same(
                    _.pick(block.options, _.keys(expectedOptions)),
                    expectedOptions
                )
            );
        });

       it("override blocks", () => {
            const block = new StringBlock("SELECT");
            inst = squel.delete({}, [block]);

            assert.same([block], inst.blocks);
        });
    });

   describe("build query", () => {
       it("no need to call from()", () => {
            inst.toString();
        });

       describe(">> from(table)", () => {
           beforeEach(() => {
                inst.from("table");
            });
            it('toString()', () => {
                assert.same(inst.toString(), "DELETE FROM table");
            });

           describe(">> table(table2, t2)", () => {
               beforeEach(() => {
                    inst.from("table2", "t2");
                });
                it('toString()', () => {
                    assert.same(
                        inst.toString(),
                        "DELETE FROM table2 `t2`"
                    );
                });

               describe(">> where(a = 1)", () => {
                   beforeEach(() => {
                        inst.where("a = 1");
                    });
                    it('toString()', () => {
                        assert.same(
                            inst.toString(),
                            "DELETE FROM table2 `t2` WHERE (a = 1)"
                        );
                    });

                   describe(">> join(other_table)", () => {
                       beforeEach(() => {
                            inst.join(
                                "other_table",
                                "o",
                                "o.id = t2.id"
                            );
                        });
                        it('toString()', () => {
                            assert.same(
                                inst.toString(),
                                "DELETE FROM table2 `t2` INNER JOIN other_table `o` ON (o.id = t2.id) WHERE (a = 1)"
                            );
                        });

                       describe(">> order(a, true)", () => {
                           beforeEach(() => {
                                inst.order("a", true);
                            });
                            it('toString()', () => {
                                assert.same(
                                    inst.toString(),
                                    "DELETE FROM table2 `t2` INNER JOIN other_table `o` ON (o.id = t2.id) WHERE (a = 1) ORDER BY a ASC"
                                );
                            });

                           describe(">> limit(2)", () => {
                               beforeEach(() => {
                                    inst.limit(2);
                                });
                                it('toString()', () => {
                                    assert.same(
                                        inst.toString(),
                                        "DELETE FROM table2 `t2` INNER JOIN other_table `o` ON (o.id = t2.id) WHERE (a = 1) ORDER BY a ASC LIMIT 2"
                                    );
                                });
                            });
                        });
                    });
                });
            });
        });

        describe('>> target(table1).from(table1).left_join(table2, null, "table1.a = table2.b")', () => {
               beforeEach(() => {
                    inst
                        .target("table1")
                        .from("table1")
                        .left_join("table2", null, "table1.a = table2.b")
                        .where("c = ?", 3);
                });
                it('toString()', () => {
                    assert.same(
                        inst.toString(),
                        "DELETE table1 FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = 3)"
                    );
                });
                it('toParam()', () => {
                    assert.same(inst.toParam(), {
                        text: "DELETE table1 FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = ?)",
                        values: [3],
                    });
                });

               describe(">> target(table2)", () => {
                   beforeEach(() => {
                        inst.target("table2");
                    });
                    it('toString()', () => {
                        assert.same(
                            inst.toString(),
                            "DELETE table1, table2 FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = 3)"
                        );
                    });
                    it('toParam()', () => {
                        assert.same(inst.toParam(), {
                            text: "DELETE table1, table2 FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = ?)",
                            values: [3],
                        });
                    });
                });
            });

       describe('>> from(table1).left_join(table2, null, "table1.a = table2.b")', () => {
           beforeEach(() => {
                inst
                    .from("table1")
                    .left_join("table2", null, "table1.a = table2.b")
                    .where("c = ?", 3);
            });
            it('toString()', () => {
                assert.same(
                    inst.toString(),
                    "DELETE FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = 3)"
                );
            });
            it('toParam()', () => {
                assert.same(inst.toParam(), {
                    text: "DELETE FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = ?)",
                    values: [3],
                });
            });
        });
    });

    it('cloning()', () => {
        const newinst = inst.from("students").limit(10).clone();
        newinst.limit(20);

        assert.same("DELETE FROM students LIMIT 10", inst.toString());
        assert.same("DELETE FROM students LIMIT 20", newinst.toString());
    });
});
