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

import sinon from "sinon";
import _ from "underscore";
import { squel } from "../src";
import { BaseBuilder, DefaultQueryBuilderOptions } from '../src/base-builder';

import { assert } from "chai";

let mocker;
let inst = squel.expr();

assert.same = function (actual, expected, message) {
    assert.deepEqual(actual, expected, message);
};

describe("Expression builder base class", () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
        inst = squel.expr();
    });

    afterEach(() => {
        mocker.restore();
    });

   it("extends BaseBuilder", () => {
        assert.ok(inst instanceof BaseBuilder);
    });

   it("toString() returns empty", () => {
        assert.same("", inst.toString());
    });

    describe('options', () => {
       it("default options", () => {
            assert.same(
                DefaultQueryBuilderOptions,
                inst.options
            );
        });
       it("custom options", () => {
            const e = squel.expr({
                separator: ",asdf",
            });

            const expected = _.extend(
                {},
                DefaultQueryBuilderOptions,
                {
                    separator: ",asdf",
                }
            );

            assert.same(expected, e.options);
        });
    });

   describe("and()", () => {
       it("without an argument throws an error", () => {
            assert.throws(
                () => inst.and(),
                "expression must be a string or builder instance"
            );
        });
       it("with an array throws an error", () => {
            assert.throws(
                () => inst.and([1]),
                "expression must be a string or builder instance"
            );
        });
       it("with an object throws an error", () => {
            assert.throws(
                () => inst.and(new Object()),
                "expression must be a string or builder instance"
            );
        });
       it("with a function throws an error", () => {
            assert.throws(
                () => inst.and(() => 1),
                "expression must be a string or builder instance"
            );
        });
       it("with an Expression returns object instance", () => {
            assert.same(inst, inst.and(squel.expr()));
        });
       it("with a builder returns object instance", () => {
            assert.same(inst, inst.and(squel.str()));
        });
       it("with a string returns object instance", () => {
            assert.same(inst, inst.and("bla"));
        });
    });

   describe("or()", () => {
       it("without an argument throws an error", () => {
            assert.throws(
                () => inst.or(),
                "expression must be a string or builder instance"
            );
        });
       it("with an array throws an error", () => {
            assert.throws(
                () => inst.or([1]),
                "expression must be a string or builder instance"
            );
        });
       it("with an object throws an error", () => {
            assert.throws(
                () => inst.or(new Object()),
                "expression must be a string or builder instance"
            );
        });
       it("with a function throws an error", () => {
            assert.throws(
                () => inst.or(() => 1),
                "expression must be a string or builder instance"
            );
        });
       it("with an Expression returns object instance", () => {
            assert.same(inst, inst.or(squel.expr()));
        });
       it("with a builder returns object instance", () => {
            assert.same(inst, inst.or(squel.str()));
        });
       it("with a string returns object instance", () => {
            assert.same(inst, inst.or("bla"));
        });
    });

   describe('and("test = 3")', () => {
       beforeEach(() => {
            return inst.and("test = 3");
        });

       it(">> toString()", () => {
            assert.same(inst.toString(), "test = 3");
        });

       it(">> toParam()", () => {
            assert.same(inst.toParam(), {
                text: "test = 3",
                values: [],
            });
        });

       describe(">> and(\"flight = '4'\")", () => {
           beforeEach(() => {
                return inst.and("flight = '4'");
            });

           it(">> toString()", () => {
                assert.same(
                    inst.toString(),
                    "test = 3 AND flight = '4'"
                );
            });

           it(">> toParam()", () => {
                assert.same(inst.toParam(), {
                    text: "test = 3 AND flight = '4'",
                    values: [],
                });
            });

           describe('>> or("dummy IN (1,2,3)")', () => {
               beforeEach(() => {
                    return inst.or("dummy IN (1,2,3)");
                });

               it(">> toString()", () => {
                    assert.same(
                        inst.toString(),
                        "test = 3 AND flight = '4' OR dummy IN (1,2,3)"
                    );
                });

               it(">> toParam()", () => {
                    assert.same(inst.toParam(), {
                        text: "test = 3 AND flight = '4' OR dummy IN (1,2,3)",
                        values: [],
                    });
                });
            });
        });
    });

   describe('and("test = ?", null)', () => {
       beforeEach(() => {
            return inst.and("test = ?", null);
        });

       it(">> toString()", () => {
            assert.same(inst.toString(), "test = NULL");
        });

       it(">> toParam()", () => {
            assert.same(inst.toParam(), {
                text: "test = ?",
                values: [null],
            });
        });
    });

   describe('and("test = ?", 3)', () => {
       beforeEach(() => {
            return inst.and("test = ?", 3);
        });

       it(">> toString()", () => {
            assert.same(inst.toString(), "test = 3");
        });

       it(">> toParam()", () => {
            assert.same(inst.toParam(), {
                text: "test = ?",
                values: [3],
            });
        });

       describe('>> and("flight = ?", "4")', () => {
           beforeEach(() => {
                return inst.and("flight = ?", "4");
            });

           it(">> toString()", () => {
                assert.same(
                    inst.toString(),
                    "test = 3 AND flight = '4'"
                );
            });

           it(">> toParam()", () => {
                assert.same(inst.toParam(), {
                    text: "test = ? AND flight = ?",
                    values: [3, "4"],
                });
            });

           describe('>> or("dummy IN ?", [false, 2, null, "str"])', () => {
               beforeEach(() => {
                    return inst.or("dummy IN ?", [false, 2, null, "str"]);
                });

               it(">> toString()", () => {
                    assert.same(
                        inst.toString(),
                        "test = 3 AND flight = '4' OR dummy IN (FALSE, 2, NULL, 'str')"
                    );
                });

               it(">> toParam()", () => {
                    assert.same(inst.toParam(), {
                        text: "test = ? AND flight = ? OR dummy IN (?, ?, ?, ?)",
                        values: [3, "4", false, 2, null, "str"],
                    });
                });
            });
        });
    });

   describe('or("test = 3")', () => {
       beforeEach(() => {
            return inst.or("test = 3");
        });

       it(">> toString()", () => {
            assert.same(inst.toString(), "test = 3");
        });

       it(">> toParam()", () => {
            assert.same(inst.toParam(), {
                text: "test = 3",
                values: [],
            });
        });

       describe(">> or(\"flight = '4'\")", () => {
           beforeEach(() => {
                return inst.or("flight = '4'");
            });

           it(">> toString()", () => {
                assert.same(
                    inst.toString(),
                    "test = 3 OR flight = '4'"
                );
            });

           it(">> toString()", () => {
                assert.same(inst.toParam(), {
                    text: "test = 3 OR flight = '4'",
                    values: [],
                });
            });

           describe('>> and("dummy IN (1,2,3)")', () => {
               beforeEach(() => {
                    return inst.and("dummy IN (1,2,3)");
                });

               it(">> toString()", () => {
                    assert.same(
                        inst.toString(),
                        "test = 3 OR flight = '4' AND dummy IN (1,2,3)"
                    );
                });

               it(">> toParam()", () => {
                    assert.same(inst.toParam(), {
                        text: "test = 3 OR flight = '4' AND dummy IN (1,2,3)",
                        values: [],
                    });
                });
            });
        });
    });

   describe('or("test = ?", 3)', () => {
       beforeEach(() => {
            return inst.or("test = ?", 3);
        });

       it(">> toString()", () => {
            assert.same(inst.toString(), "test = 3");
        });

       it(">> toParam()", () => {
            assert.same(inst.toParam(), {
                text: "test = ?",
                values: [3],
            });
        });

       describe('>> or("flight = ?", "4")', () => {
           beforeEach(() => {
                return inst.or("flight = ?", "4");
            });

           it(">> toString()", () => {
                assert.same(
                    inst.toString(),
                    "test = 3 OR flight = '4'"
                );
            });

           it(">> toParam()", () => {
                assert.same(inst.toParam(), {
                    text: "test = ? OR flight = ?",
                    values: [3, "4"],
                });
            });

           describe('>> and("dummy IN ?", [false, 2, null, "str"])', () => {
               beforeEach(() => {
                    return inst.and("dummy IN ?", [false, 2, null, "str"]);
                });

               it(">> toString()", () => {
                    assert.same(
                        inst.toString(),
                        "test = 3 OR flight = '4' AND dummy IN (FALSE, 2, NULL, 'str')"
                    );
                });

               it(">> toParam()", () => {
                    assert.same(inst.toParam(), {
                        text: "test = ? OR flight = ? AND dummy IN (?, ?, ?, ?)",
                        values: [3, "4", false, 2, null, "str"],
                    });
                });
            });
        });
    });

   describe('or("test = ?", 4)', () => {
       beforeEach(() => {
            return inst.or("test = ?", 4);
        });

       describe('>> and(expr().or("inner = ?", 1))', () => {
           beforeEach(() => {
                return inst.and(squel.expr().or("inner = ?", 1));
            });

           it(">> toString()", () => {
                assert.same(
                    inst.toString(),
                    "test = 4 AND (inner = 1)"
                );
            });

           it(">> toParam()", () => {
                assert.same(inst.toParam(), {
                    text: "test = ? AND (inner = ?)",
                    values: [4, 1],
                });
            });
        });

       describe('>> and(expr().or("inner = ?", 1).or(expr().and("another = ?", 34)))', () => {
           beforeEach(() => {
                return inst.and(
                    squel
                        .expr()
                        .or("inner = ?", 1)
                        .or(squel.expr().and("another = ?", 34))
                );
            });

           it(">> toString()", () => {
                assert.same(
                    inst.toString(),
                    "test = 4 AND (inner = 1 OR (another = 34))"
                );
            });

           it(">> toParam()", () => {
                assert.same(inst.toParam(), {
                    text: "test = ? AND (inner = ? OR (another = ?))",
                    values: [4, 1, 34],
                });
            });
        });
    });

   describe("custom parameter character: @@", () => {
       beforeEach(() => {
            return (inst.options.parameterCharacter = "@@");
        });

        describe('and("test = @@", 3).and("flight = @@", "4").or("dummy IN @@", [false, 2, null, "str"])', () => {
               beforeEach(() => {
                    return inst
                        .and("test = @@", 3)
                        .and("flight = @@", "4")
                        .or("dummy IN @@", [false, 2, null, "str"]);
                });

               it(">> toString()", () => {
                    assert.same(
                        inst.toString(),
                        "test = 3 AND flight = '4' OR dummy IN (FALSE, 2, NULL, 'str')"
                    );
                });

               it(">> toParam()", () => {
                    assert.same(inst.toParam(), {
                        text: "test = @@ AND flight = @@ OR dummy IN (@@, @@, @@, @@)",
                        values: [3, "4", false, 2, null, "str"],
                    });
                });
        });
    });

    it('cloning', () => {
        const newinst = inst
            .or("test = 4")
            .or("inner = 1")
            .or("inner = 2")
            .clone();
        newinst.or("inner = 3");

        assert.same(inst.toString(), "test = 4 OR inner = 1 OR inner = 2");
        assert.same(
            newinst.toString(),
            "test = 4 OR inner = 1 OR inner = 2 OR inner = 3"
        );
    });

   it("custom array prototype methods (Issue #210)", () => {
        Array.prototype.last = function () {
            return this[this.length - 1];
        };

        inst.or("foo = ?", "bar");

        delete Array.prototype.last;
    });

   describe("any type of builder", () => {
       beforeEach(() => {
            return inst
                .or("b = ?", 5)
                .or(squel.select().from("blah").where("a = ?", 9));
        });
        it('toString()', () => {
            assert.same(
                inst.toString(),
                "b = 5 OR (SELECT * FROM blah WHERE (a = 9))"
            );
        });
        it('toParam()', () => {
            assert.same(inst.toParam(), {
                text: "b = ? OR (SELECT * FROM blah WHERE (a = ?))",
                values: [5, 9],
            });
        });
    });

   describe("#286 - nesting", () => {
       beforeEach(() => {
            return (inst = squel
                .expr()
                .and(
                    squel
                        .expr()
                        .and(squel.expr().and("A").and("B"))
                        .or(squel.expr().and("C").and("D"))
                )
                .and("E"));
        });
        it('toString()', () => {
            assert.same(
                inst.toString(),
                "((A AND B) OR (C AND D)) AND E"
            );
        });
        it('toParam()', () => {
            assert.same(inst.toParam(), {
                text: "((A AND B) OR (C AND D)) AND E",
                values: [],
            });
        });
    });
});
