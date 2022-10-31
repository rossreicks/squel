/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
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
import {
    FunctionBlock,
    OrderByBlock,
    HavingBlock,
    FromTableBlock,
    TargetTableBlock,
    LimitBlock,
    GroupByBlock,
    DistinctBlock,
    InsertFieldsFromQueryBlock,
    InsertFieldValueBlock,
    IntoTableBlock,
    OffsetBlock,
    GetFieldBlock,
    WhereBlock,
    JoinBlock,
    StringBlock,
    Block,
} from "../src/block";
import { AbstractConditionBlock } from "../src/block/abstract-condition-block";
import { AbstractVerbSingleValueBlock } from "../src/block/abstract-verb-single-value-block";
import { AbstractSetFieldBlock } from "../src/block/abstract-set-field-block";
import { DefaultQueryBuilderOptions } from "../src/base-builder";
import { AbstractTableBlock } from "../src/block/abstract-table-block";
import { SetFieldBlock } from "../src/block/set-field-block";
import { Select } from "../src/methods/select";
import { UpdateTableBlock } from "../src/block/update-table-block";
import { QueryBuilder } from "../src/query-builder";

import { assert } from "chai";

let mocker;
let inst = new Block();

assert.same = function (actual, expected, message) {
    return assert.deepEqual(actual, expected, message);
};

describe("Blocks", () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
    });

    afterEach(() => {
        mocker.restore();
    });
    describe("Block base class", () => {
        beforeEach(() => {
            return (inst = new Block());
        });

        it("instanceof of BaseBuilder", () => {
            const expectedOptions = _.extend({});
            DefaultQueryBuilderOptions,
                {
                    usingValuePlaceholders: true,
                    dummy: true,
                };

            inst = new Block({
                usingValuePlaceholders: true,
                dummy: true,
            });

            assert.same(expectedOptions, inst.options);
        });

        describe("exposedMethods()", () => {
            it("returns methods", () => {
                inst["method1"] = () => false;
                inst["method2"] = () => false;

                assert.ok(
                    ["method1", "method2"],
                    (() => {
                        const result = [];
                        for (var name in inst.exposedMethods()) {
                            result.push(name);
                        }
                        return result;
                    })()
                );
            });

            it("ignores methods prefixed with _", () => {
                let name;
                inst["_method"] = () => false;

                assert.ok(
                    undefined ===
                        _.find(
                            (() => {
                                const result = [];
                                for (name in inst.exposedMethods()) {
                                    result.push(name);
                                }
                                return result;
                            })(),
                            (name) => name === "_method"
                        )
                );
            });

            it("ignores toString()", () => {
                let name;
                assert.ok(
                    undefined ===
                        _.find(
                            (() => {
                                const result = [];
                                for (name in inst.exposedMethods()) {
                                    result.push(name);
                                }
                                return result;
                            })(),
                            (name) => name === "toString"
                        )
                );
            });
        });

        it("cloning copies the options over", () => {
            inst.options.dummy = true;

            const newinst = inst.clone();

            inst.options.dummy = false;

            assert.same(true, newinst.options.dummy);
        });
    });

    describe("StringBlock", () => {
        beforeEach(() => {
            this.cls = StringBlock;
            return (inst = new this.cls());
        });

        it("instanceof of Block", () => {
            assert.instanceOf(inst, Block);
        });

        describe("_toParamString()", () => {
            it("non-parameterized", () => {
                inst = new this.cls({}, "TAG");

                assert.same(inst._toParamString(), {
                    text: "TAG",
                    values: [],
                });
            });
            it("parameterized", () => {
                inst = new this.cls({}, "TAG");

                assert.same(inst._toParamString({ buildParameterized: true }), {
                    text: "TAG",
                    values: [],
                });
            });

            describe("FunctionBlock", () => {
                beforeEach(() => {
                    this.cls = FunctionBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                it("initial member values", () => {
                    assert.same([], inst._values);
                    assert.same([], inst._strings);
                });

                describe("_toParamString()", () => {
                    it("when not set", () => {
                        assert.same(inst._toParamString(), {
                            text: "",
                            values: [],
                        });
                    });
                    it("non-parameterized", () => {
                        inst.function("bla");
                        inst.function("bla2");

                        assert.same(inst._toParamString(), {
                            text: "bla bla2",
                            values: [],
                        });
                    });
                    it("parameterized", () => {
                        inst.function("bla ?", 2);
                        inst.function("bla2 ?", 3);

                        assert.same(
                            inst._toParamString({ buildParameterized: true }),
                            {
                                text: "bla ? bla2 ?",
                                values: [2, 3],
                            }
                        );
                    });
                });
            });

            describe("AbstractTableBlock", () => {
                beforeEach(() => {
                    this.cls = AbstractTableBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                it("initial field values", () => {
                    assert.same([], inst._tables);
                });

                describe("has table", () => {
                    it("no", () => {
                        assert.same(false, inst._hasTable());
                    });
                    it("yes", () => {
                        inst._table("blah");
                        assert.same(true, inst._hasTable());
                    });
                });

                describe("_table()", () => {
                    it("saves inputs", () => {
                        inst._table("table1");
                        inst._table("table2", "alias2");
                        inst._table("table3");

                        const expectedFroms = [
                            {
                                table: "table1",
                                alias: null,
                            },
                            {
                                table: "table2",
                                alias: "alias2",
                            },
                            {
                                table: "table3",
                                alias: null,
                            },
                        ];

                        assert.same(expectedFroms, inst._tables);
                    });

                    it("sanitizes inputs", () => {
                        const sanitizeTableSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeTable",
                            () => "_t"
                        );
                        const sanitizeAliasSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeTableAlias",
                            () => "_a"
                        );

                        inst._table("table", "alias");

                        assert.ok(sanitizeTableSpy.calledWith("table"));
                        assert.ok(sanitizeAliasSpy.calledWithExactly("alias"));

                        assert.same(
                            [{ table: "_t", alias: "_a" }],
                            inst._tables
                        );
                    });

                    it("handles single-table mode", () => {
                        inst.options.singleTable = true;

                        inst._table("table1");
                        inst._table("table2");
                        inst._table("table3");

                        const expected = [
                            {
                                table: "table3",
                                alias: null,
                            },
                        ];

                        assert.same(expected, inst._tables);
                    });

                    it("builder as table", () => {
                        const sanitizeTableSpy = mocker.spy(
                            this.cls.prototype,
                            "_sanitizeTable"
                        );

                        const innerTable1 = squel.select();
                        const innerTable2 = squel.select();

                        inst._table(innerTable1);
                        inst._table(innerTable2, "Inner2");

                        assert.ok(
                            sanitizeTableSpy.calledWithExactly(innerTable1)
                        );
                        assert.ok(
                            sanitizeTableSpy.calledWithExactly(innerTable2)
                        );

                        const expected = [
                            {
                                alias: null,
                                table: innerTable1,
                            },
                            {
                                alias: "Inner2",
                                table: innerTable2,
                            },
                        ];

                        assert.same(expected, inst._tables);
                    });
                });

                describe("_toParamString()", () => {
                    beforeEach(() => {
                        return (this.innerTable1 = squel
                            .select()
                            .from("inner1")
                            .where("a = ?", 3));
                    });

                    it("no table", () => {
                        assert.same(inst._toParamString(), {
                            text: "",
                            values: [],
                        });
                    });

                    it("prefix", () => {
                        inst.options.prefix = "TEST";

                        inst._table("table2", "alias2");

                        assert.same(inst._toParamString(), {
                            text: "TEST table2 `alias2`",
                            values: [],
                        });
                    });

                    it("non-parameterized", () => {
                        inst._table(this.innerTable1);
                        inst._table("table2", "alias2");
                        inst._table("table3");

                        assert.same(inst._toParamString(), {
                            text: "(SELECT * FROM inner1 WHERE (a = 3)), table2 `alias2`, table3",
                            values: [],
                        });
                    });
                    it("parameterized", () => {
                        inst._table(this.innerTable1);
                        inst._table("table2", "alias2");
                        inst._table("table3");

                        assert.same(
                            inst._toParamString({ buildParameterized: true }),
                            {
                                text: "(SELECT * FROM inner1 WHERE (a = ?)), table2 `alias2`, table3",
                                values: [3],
                            }
                        );
                    });
                });
            });

            describe("FromTableBlock", () => {
                beforeEach(() => {
                    this.cls = FromTableBlock;
                    return (inst = new this.cls());
                });

                it("check prefix", () => {
                    assert.same(inst.options.prefix, "FROM");
                });

                it("instanceof of AbstractTableBlock", () => {
                    assert.instanceOf(inst, AbstractTableBlock);
                });

                describe("from()", () => {
                    it("calls base class handler", () => {
                        const baseMethodSpy = mocker.stub(
                            AbstractTableBlock.prototype,
                            "_table"
                        );

                        inst.from("table1");
                        inst.from("table2", "alias2");

                        assert.same(2, baseMethodSpy.callCount);
                        assert.ok(
                            baseMethodSpy.calledWithExactly("table1", null)
                        );
                        assert.ok(
                            baseMethodSpy.calledWithExactly("table2", "alias2")
                        );
                    });
                });
            });

            describe("UpdateTableBlock", () => {
                beforeEach(() => {
                    this.cls = UpdateTableBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of AbstractTableBlock", () => {
                    assert.instanceOf(inst, AbstractTableBlock);
                });

                it("check prefix", () => {
                    assert.same(inst.options.prefix, undefined);
                });

                describe("table()", () => {
                    it("calls base class handler", () => {
                        const baseMethodSpy = mocker.stub(
                            AbstractTableBlock.prototype,
                            "_table"
                        );

                        inst.table("table1");
                        inst.table("table2", "alias2");

                        assert.same(2, baseMethodSpy.callCount);
                        assert.ok(
                            baseMethodSpy.calledWithExactly("table1", null)
                        );
                        assert.ok(
                            baseMethodSpy.calledWithExactly("table2", "alias2")
                        );
                    });
                });
            });

            describe("TargetTableBlock", () => {
                beforeEach(() => {
                    this.cls = TargetTableBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of AbstractTableBlock", () => {
                    assert.instanceOf(inst, AbstractTableBlock);
                });

                it("check prefix", () => {
                    assert.same(inst.options.prefix, undefined);
                });

                describe("table()", () => {
                    it("calls base class handler", () => {
                        const baseMethodSpy = mocker.stub(
                            AbstractTableBlock.prototype,
                            "_table"
                        );

                        inst.target("table1");
                        inst.target("table2");

                        assert.same(2, baseMethodSpy.callCount);
                        assert.ok(baseMethodSpy.calledWithExactly("table1"));
                        assert.ok(baseMethodSpy.calledWithExactly("table2"));
                    });
                });
            });

            describe("IntoTableBlock", () => {
                beforeEach(() => {
                    this.cls = IntoTableBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of AbstractTableBlock", () => {
                    assert.instanceOf(inst, AbstractTableBlock);
                });

                it("check prefix", () => {
                    assert.same(inst.options.prefix, "INTO");
                });

                it("single table", () => {
                    assert.ok(inst.options.singleTable);
                });

                describe("into()", () => {
                    it("calls base class handler", () => {
                        const baseMethodSpy = mocker.stub(
                            AbstractTableBlock.prototype,
                            "_table"
                        );

                        inst.into("table1");
                        inst.into("table2");

                        assert.same(2, baseMethodSpy.callCount);
                        assert.ok(baseMethodSpy.calledWith("table1"));
                        assert.ok(baseMethodSpy.calledWith("table2"));
                    });
                });

                describe("_toParamString()", () => {
                    it("requires table to have been provided", () => {
                        try {
                            inst._toParamString();
                            throw new Error("should not reach here");
                        } catch (err) {
                            assert.same(
                                "Error: into() needs to be called",
                                err.toString()
                            );
                        }
                    });
                });
            });

            describe("GetFieldBlock", () => {
                beforeEach(() => {
                    this.cls = GetFieldBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                describe("fields() - object", () => {
                    it("saves inputs", () => {
                        const fieldSpy = mocker.spy(inst, "field");

                        inst.fields({
                            field1: null,
                            field2: "alias2",
                            field3: null,
                        });
                        {
                            dummy: true;
                        }

                        const expected = [
                            {
                                name: "field1",
                                alias: null,
                                options: {
                                    dummy: true,
                                },
                            },
                            {
                                name: "field2",
                                alias: "alias2",
                                options: {
                                    dummy: true,
                                },
                            },
                            {
                                name: "field3",
                                alias: null,
                                options: {
                                    dummy: true,
                                },
                            },
                        ];

                        assert.ok(fieldSpy.calledThrice);
                        assert.ok(
                            fieldSpy.calledWithExactly("field1", null, {
                                dummy: true,
                            })
                        );
                        assert.ok(
                            fieldSpy.calledWithExactly("field2", "alias2", {
                                dummy: true,
                            })
                        );
                        assert.ok(
                            fieldSpy.calledWithExactly("field3", null, {
                                dummy: true,
                            })
                        );

                        assert.same(expected, inst._fields);
                    });
                });

                describe("fields() - array", () => {
                    it("saves inputs", () => {
                        const fieldSpy = mocker.spy(inst, "field");

                        inst.fields(["field1", "field2", "field3"], {
                            dummy: true,
                        });

                        const expected = [
                            {
                                name: "field1",
                                alias: null,
                                options: {
                                    dummy: true,
                                },
                            },
                            {
                                name: "field2",
                                alias: null,
                                options: {
                                    dummy: true,
                                },
                            },
                            {
                                name: "field3",
                                alias: null,
                                options: {
                                    dummy: true,
                                },
                            },
                        ];

                        assert.ok(fieldSpy.calledThrice);
                        assert.ok(
                            fieldSpy.calledWithExactly("field1", null, {
                                dummy: true,
                            })
                        );
                        assert.ok(
                            fieldSpy.calledWithExactly("field2", null, {
                                dummy: true,
                            })
                        );
                        assert.ok(
                            fieldSpy.calledWithExactly("field3", null, {
                                dummy: true,
                            })
                        );

                        assert.same(expected, inst._fields);
                    });
                });

                describe("field()", () => {
                    it("saves inputs", () => {
                        inst.field("field1");
                        inst.field("field2", "alias2");
                        inst.field("field3");

                        const expected = [
                            {
                                name: "field1",
                                alias: null,
                                options: {},
                            },
                            {
                                name: "field2",
                                alias: "alias2",
                                options: {},
                            },
                            {
                                name: "field3",
                                alias: null,
                                options: {},
                            },
                        ];

                        assert.same(expected, inst._fields);
                    });
                });

                describe("field() - discard duplicates", () => {
                    it("saves inputs", () => {
                        inst.field("field1");
                        inst.field("field2", "alias2");
                        inst.field("field2", "alias2");
                        inst.field("field1", "alias1");

                        const expected = [
                            {
                                name: "field1",
                                alias: null,
                                options: {},
                            },
                            {
                                name: "field2",
                                alias: "alias2",
                                options: {},
                            },
                            {
                                name: "field1",
                                alias: "alias1",
                                options: {},
                            },
                        ];

                        assert.same(expected, inst._fields);
                    });

                    it("sanitizes inputs", () => {
                        const sanitizeFieldSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeField",
                            () => "_f"
                        );
                        const sanitizeAliasSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeFieldAlias",
                            () => "_a"
                        );

                        inst.field("field1", "alias1", { dummy: true });

                        assert.ok(sanitizeFieldSpy.calledWithExactly("field1"));
                        assert.ok(sanitizeAliasSpy.calledWithExactly("alias1"));

                        assert.same(inst._fields, [
                            {
                                name: "_f",
                                alias: "_a",
                                options: {
                                    dummy: true,
                                },
                            },
                        ]);
                    });
                });

                describe("_toParamString()", () => {
                    beforeEach(() => {
                        this.queryBuilder = squel.select();
                        return (this.fromTableBlock =
                            this.queryBuilder.getBlock(FromTableBlock));
                    });

                    it("returns all fields when none provided and table is set", () => {
                        this.fromTableBlock._hasTable = () => true;

                        assert.same(
                            inst._toParamString({
                                queryBuilder: this.queryBuilder,
                            }),
                            {
                                text: "*",
                                values: [],
                            }
                        );
                    });

                    it("but returns nothing if no table set", () => {
                        this.fromTableBlock._hasTable = () => false;

                        assert.same(
                            inst._toParamString({
                                queryBuilder: this.queryBuilder,
                            }),
                            {
                                text: "",
                                values: [],
                            }
                        );
                    });

                    it("returns formatted query phrase", () => {
                        beforeEach(() => {
                            this.fromTableBlock._hasTable = () => true;
                            inst.field(squel.str("GETDATE(?)", 3), "alias1");
                            inst.field("field2", "alias2", { dummy: true });
                            return inst.field("field3");
                        });
                        it("non-parameterized", () => {
                            assert.same(
                                inst._toParamString({
                                    queryBuilder: this.queryBuilder,
                                }),
                                {
                                    text: '(GETDATE(3)) AS "alias1", field2 AS "alias2", field3',
                                    values: [],
                                }
                            );
                        });
                        it("parameterized", () => {
                            assert.same(
                                inst._toParamString({
                                    queryBuilder: this.queryBuilder,
                                    buildParameterized: true,
                                }),
                                {
                                    text: '(GETDATE(?)) AS "alias1", field2 AS "alias2", field3',
                                    values: [3],
                                }
                            );
                        });
                    });
                });
            });

            describe("AbstractSetFieldBlock", () => {
                beforeEach(() => {
                    this.cls = AbstractSetFieldBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                describe("_set()", () => {
                    it("saves inputs", () => {
                        inst._set("field1", "value1", { dummy: 1 });
                        inst._set("field2", "value2", { dummy: 2 });
                        inst._set("field3", "value3", { dummy: 3 });
                        inst._set("field4");

                        const expectedFields = [
                            "field1",
                            "field2",
                            "field3",
                            "field4",
                        ];
                        const expectedValues = [
                            ["value1", "value2", "value3", undefined],
                        ];
                        const expectedFieldOptions = [
                            [{ dummy: 1 }, { dummy: 2 }, { dummy: 3 }, {}],
                        ];

                        assert.same(expectedFields, inst._fields);
                        assert.same(expectedValues, inst._values);
                        assert.same(expectedFieldOptions, inst._valueOptions);
                    });

                    it("sanitizes inputs", () => {
                        const sanitizeFieldSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeField",
                            () => "_f"
                        );
                        const sanitizeValueSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeValue",
                            () => "_v"
                        );

                        inst._set("field1", "value1", { dummy: true });

                        assert.ok(sanitizeFieldSpy.calledWithExactly("field1"));
                        assert.ok(sanitizeValueSpy.calledWithExactly("value1"));

                        assert.same(["_f"], inst._fields);
                        assert.same([["_v"]], inst._values);
                    });
                });

                describe("_setFields()", () => {
                    it("saves inputs", () => {
                        inst._setFields({
                            field1: "value1",
                            field2: "value2",
                            field3: "value3",
                        });

                        const expectedFields = ["field1", "field2", "field3"];
                        const expectedValues = [["value1", "value2", "value3"]];
                        const expectedFieldOptions = [[{}, {}, {}]];

                        assert.same(expectedFields, inst._fields);
                        assert.same(expectedValues, inst._values);
                        assert.same(expectedFieldOptions, inst._valueOptions);
                    });

                    it("sanitizes inputs", () => {
                        const sanitizeFieldSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeField",
                            () => "_f"
                        );
                        const sanitizeValueSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeValue",
                            () => "_v"
                        );

                        inst._setFields({ field1: "value1" }, { dummy: true });

                        assert.ok(sanitizeFieldSpy.calledWithExactly("field1"));
                        assert.ok(sanitizeValueSpy.calledWithExactly("value1"));

                        assert.same(["_f"], inst._fields);
                        assert.same([["_v"]], inst._values);
                    });
                });

                describe("_setFieldsRows()", () => {
                    it("saves inputs", () => {
                        inst._setFieldsRows([
                            {
                                field1: "value1",
                                field2: "value2",
                                field3: "value3",
                            },
                            {
                                field1: "value21",
                                field2: "value22",
                                field3: "value23",
                            },
                        ]);

                        const expectedFields = ["field1", "field2", "field3"];
                        const expectedValues = [
                            ["value1", "value2", "value3"],
                            ["value21", "value22", "value23"],
                        ];
                        const expectedFieldOptions = [
                            [{}, {}, {}],
                            [{}, {}, {}],
                        ];

                        assert.same(expectedFields, inst._fields);
                        assert.same(expectedValues, inst._values);
                        assert.same(expectedFieldOptions, inst._valueOptions);
                    });

                    it("sanitizes inputs", () => {
                        const sanitizeFieldSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeField",
                            () => "_f"
                        );
                        const sanitizeValueSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeValue",
                            () => "_v"
                        );

                        inst._setFieldsRows(
                            [
                                {
                                    field1: "value1",
                                },
                                {
                                    field1: "value21",
                                },
                            ],
                            { dummy: true }
                        );

                        assert.ok(sanitizeFieldSpy.calledWithExactly("field1"));
                        assert.ok(sanitizeValueSpy.calledWithExactly("value1"));
                        assert.ok(
                            sanitizeValueSpy.calledWithExactly("value21")
                        );

                        assert.same(["_f"], inst._fields);
                        assert.same([["_v"], ["_v"]], inst._values);
                    });
                });

                it("_toParamString()", () => {
                    assert.throws(
                        () => inst._toParamString(),
                        "Not yet implemented"
                    );
                });
            });

            describe("SetFieldBlock", () => {
                beforeEach(() => {
                    return (inst = new SetFieldBlock());
                });

                it("instanceof of AbstractSetFieldBlock", () => {
                    assert.instanceOf(inst, AbstractSetFieldBlock);
                });

                describe("set()", () => {
                    it("calls to _set()", () => {
                        const spy = mocker.stub(inst, "_set");

                        inst.set("f", "v", { dummy: true });

                        assert.ok(
                            spy.calledWithExactly("f", "v", { dummy: true })
                        );
                    });
                });

                describe("setFields()", () => {
                    it("calls to _setFields()", () => {
                        const spy = mocker.stub(inst, "_setFields");

                        inst.setFields("f", { dummy: true });

                        assert.ok(spy.calledWithExactly("f", { dummy: true }));
                    });
                });

                describe("_toParamString()", () => {
                    it("needs at least one field to have been provided", () => {
                        try {
                            inst.toString();
                            throw new Error("should not reach here");
                        } catch (err) {
                            assert.same(
                                "Error: set() needs to be called",
                                err.toString()
                            );
                        }
                    });

                    describe("fields set", () => {
                        beforeEach(() => {
                            inst.set("field0 = field0 + 1");
                            inst.set("field1", "value1", { dummy: true });
                            inst.set("field2", "value2");
                            return inst.set(
                                "field3",
                                squel.str("GETDATE(?)", 4)
                            );
                        });
                        it("non-parameterized", () => {
                            assert.same(inst._toParamString(), {
                                text: "SET field0 = field0 + 1, field1 = 'value1', field2 = 'value2', field3 = (GETDATE(4))",
                                values: [],
                            });
                        });
                        it("parameterized", () => {
                            assert.same(
                                inst._toParamString({
                                    buildParameterized: true,
                                }),
                                {
                                    text: "SET field0 = field0 + 1, field1 = ?, field2 = ?, field3 = (GETDATE(?))",
                                    values: ["value1", "value2", 4],
                                }
                            );
                        });
                    });
                });
            });

            describe("InsertFieldValueBlock", () => {
                beforeEach(() => {
                    this.cls = InsertFieldValueBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of AbstractSetFieldBlock", () => {
                    assert.instanceOf(inst, AbstractSetFieldBlock);
                });

                describe("set()", () => {
                    it("calls to _set()", () => {
                        const spy = mocker.stub(inst, "_set");

                        inst.set("f", "v", { dummy: true });

                        assert.ok(
                            spy.calledWithExactly("f", "v", { dummy: true })
                        );
                    });
                });

                describe("setFields()", () => {
                    it("calls to _setFields()", () => {
                        const spy = mocker.stub(inst, "_setFields");

                        inst.setFields("f", { dummy: true });

                        assert.ok(spy.calledWithExactly("f", { dummy: true }));
                    });
                });

                describe("setFieldsRows()", () => {
                    it("calls to _setFieldsRows()", () => {
                        const spy = mocker.stub(inst, "_setFieldsRows");

                        inst.setFieldsRows("f", { dummy: true });

                        assert.ok(spy.calledWithExactly("f", { dummy: true }));
                    });
                });

                describe("_toParamString()", () => {
                    it("needs at least one field to have been provided", () => {
                        assert.same("", inst.toString());
                    });

                    describe("got fields", () => {
                        beforeEach(() => {
                            return inst.setFieldsRows([
                                {
                                    field1: 9,
                                    field2: "value2",
                                    field3: squel.str("GETDATE(?)", 5),
                                },
                                { field1: 8, field2: true, field3: null },
                            ]);
                        });
                        it("non-parameterized", () => {
                            assert.same(inst._toParamString(), {
                                text: "(field1, field2, field3) VALUES (9, 'value2', (GETDATE(5))), (8, TRUE, NULL)",
                                values: [],
                            });
                        });
                        it("parameterized", () => {
                            assert.same(
                                inst._toParamString({
                                    buildParameterized: true,
                                }),
                                {
                                    text: "(field1, field2, field3) VALUES (?, ?, (GETDATE(?))), (?, ?, ?)",
                                    values: [9, "value2", 5, 8, true, null],
                                }
                            );
                        });
                    });
                });
            });

            describe("InsertFieldsFromQueryBlock", () => {
                beforeEach(() => {
                    this.cls = InsertFieldsFromQueryBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                describe("fromQuery()", () => {
                    it("sanitizes field names", () => {
                        const spy = mocker.stub(
                            inst,
                            "_sanitizeField",
                            () => 1
                        );

                        const qry = squel.select();

                        inst.fromQuery(["test", "one", "two"], qry);

                        assert.ok(spy.calledThrice);
                        assert.ok(spy.calledWithExactly("test"));
                        assert.ok(spy.calledWithExactly("one"));
                        assert.ok(spy.calledWithExactly("two"));
                    });

                    it("sanitizes query", () => {
                        const spy = mocker.stub(
                            inst,
                            "_sanitizeBaseBuilder",
                            () => 1
                        );

                        const qry = 123;

                        inst.fromQuery(["test", "one", "two"], qry);

                        assert.ok(spy.calledOnce);
                        assert.ok(spy.calledWithExactly(qry));
                    });

                    it("overwrites existing values", () => {
                        inst._fields = 1;
                        inst._query = 2;

                        const qry = squel.select();
                        inst.fromQuery(["test", "one", "two"], qry);

                        assert.same(qry, inst._query);
                        assert.same(["test", "one", "two"], inst._fields);
                    });
                });

                describe("_toParamString()", () => {
                    it("needs fromQuery() to have been called", () => {
                        assert.same(inst._toParamString(), {
                            text: "",
                            values: [],
                        });
                    });

                    describe("default", () => {
                        beforeEach(() => {
                            this.qry = squel
                                .select()
                                .from("mega")
                                .where("a = ?", 5);
                            return inst.fromQuery(
                                ["test", "one", "two"],
                                this.qry
                            );
                        });
                        it("non-parameterized", () => {
                            assert.same(inst._toParamString(), {
                                text: "(test, one, two) (SELECT * FROM mega WHERE (a = 5))",
                                values: [],
                            });
                        });
                        it("parameterized", () => {
                            assert.same(
                                inst._toParamString({
                                    buildParameterized: true,
                                }),
                                {
                                    text: "(test, one, two) (SELECT * FROM mega WHERE (a = ?))",
                                    values: [5],
                                }
                            );
                        });
                    });
                });
            });

            describe("DistinctBlock", () => {
                beforeEach(() => {
                    this.cls = DistinctBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                describe("_toParamString()", () => {
                    it("output nothing if not set", () => {
                        assert.same(inst._toParamString(), {
                            text: "",
                            values: [],
                        });
                    });
                    it("output DISTINCT if set", () => {
                        inst.distinct();
                        assert.same(inst._toParamString(), {
                            text: "DISTINCT",
                            values: [],
                        });
                    });
                });
            });

            describe("GroupByBlock", () => {
                beforeEach(() => {
                    this.cls = GroupByBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                describe("group()", () => {
                    it("adds to list", () => {
                        inst.group("field1");
                        inst.group("field2");

                        assert.same(["field1", "field2"], inst._groups);
                    });

                    it("sanitizes inputs", () => {
                        const sanitizeFieldSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeField",
                            () => "_f"
                        );

                        inst.group("field1");

                        assert.ok(sanitizeFieldSpy.calledWithExactly("field1"));

                        assert.same(["_f"], inst._groups);
                    });
                });

                describe("toString()", () => {
                    it("output nothing if no fields set", () => {
                        inst._groups = [];
                        assert.same("", inst.toString());
                    });

                    it("output GROUP BY", () => {
                        inst.group("field1");
                        inst.group("field2");

                        assert.same("GROUP BY field1, field2", inst.toString());
                    });
                });
            });

            describe("AbstractVerbSingleValueBlock", () => {
                beforeEach(() => {
                    this.cls = AbstractVerbSingleValueBlock;
                    return (inst = new this.cls({
                        verb: "TEST",
                    }));
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                describe("offset()", () => {
                    it("set value", () => {
                        inst._setValue(1);

                        assert.same(1, inst._value);

                        inst._setValue(22);

                        assert.same(22, inst._value);
                    });

                    it("sanitizes inputs", () => {
                        const sanitizeSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeLimitOffset",
                            () => 234
                        );

                        inst._setValue(23);

                        assert.ok(sanitizeSpy.calledWithExactly(23));

                        assert.same(234, inst._value);
                    });
                });

                describe("toString()", () => {
                    it("output nothing if not set", () => {
                        assert.same("", inst.toString());
                    });

                    it("output verb", () => {
                        inst._setValue(12);

                        assert.same("TEST 12", inst.toString());
                    });
                });

                describe("toParam()", () => {
                    it("output nothing if not set", () => {
                        assert.same({ text: "", values: [] }, inst.toParam());
                    });

                    it("output verb", () => {
                        inst._setValue(12);

                        assert.same(
                            { text: "TEST ?", values: [12] },
                            inst.toParam()
                        );
                    });
                });
            });

            describe("OffsetBlock", () => {
                beforeEach(() => {
                    this.cls = OffsetBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of AbstractVerbSingleValueBlock", () => {
                    assert.instanceOf(inst, AbstractVerbSingleValueBlock);
                });

                describe("offset()", () => {
                    it("calls base method", () => {
                        const callSpy = mocker.spy(
                            this.cls.prototype,
                            "_setValue"
                        );

                        inst.offset(1);

                        assert.ok(callSpy.calledWithExactly(1));
                    });
                });

                describe("toString()", () => {
                    it("output nothing if not set", () => {
                        assert.same("", inst.toString());
                    });

                    it("output verb", () => {
                        inst.offset(12);

                        assert.same("OFFSET 12", inst.toString());
                    });
                });

                describe("toParam()", () => {
                    it("output nothing if not set", () => {
                        assert.same({ text: "", values: [] }, inst.toParam());
                    });

                    it("output verb", () => {
                        inst.offset(12);

                        assert.same(
                            { text: "OFFSET ?", values: [12] },
                            inst.toParam()
                        );
                    });
                });

                it("can be removed using null", () => {
                    inst.offset(1);
                    inst.offset(null);

                    assert.same({ text: "", values: [] }, inst.toParam());
                });
            });

            describe("LimitBlock", () => {
                beforeEach(() => {
                    this.cls = LimitBlock;
                    return (inst = new this.cls());
                });

                it("instanceof of AbstractVerbSingleValueBlock", () => {
                    assert.instanceOf(inst, AbstractVerbSingleValueBlock);
                });

                describe("limit()", () => {
                    it("calls base method", () => {
                        const callSpy = mocker.spy(
                            this.cls.prototype,
                            "_setValue"
                        );

                        inst.limit(1);

                        assert.ok(callSpy.calledWithExactly(1));
                    });
                });

                describe("toString()", () => {
                    it("output nothing if not set", () => {
                        assert.same("", inst.toString());
                    });

                    it("output verb", () => {
                        inst.limit(12);

                        assert.same("LIMIT 12", inst.toString());
                    });
                });

                describe("toParam()", () => {
                    it("output nothing if not set", () => {
                        assert.same({ text: "", values: [] }, inst.toParam());
                    });

                    it("output verb", () => {
                        inst.limit(12);

                        assert.same(
                            { text: "LIMIT ?", values: [12] },
                            inst.toParam()
                        );
                    });
                });

                it("can be removed using null", () => {
                    inst.limit(1);
                    inst.limit(null);

                    assert.same({ text: "", values: [] }, inst.toParam());
                });
            });

            describe("AbstractConditionBlock", () => {
                class MockConditionBlock extends AbstractConditionBlock {
                    constructor(options) {
                        super(_.extend({}, options, { verb: "MOCKVERB" }));
                    }

                    mockCondition(condition, ...values) {
                        return this._condition(
                            condition,
                            ...Array.from(values)
                        );
                    }
                }

                class MockSelectWithCondition extends Select {
                    constructor(options, blocks = null) {
                        blocks = [
                            new StringBlock(options, "SELECT"),
                            new GetFieldBlock(options),
                            new FromTableBlock(options),
                            new MockConditionBlock(options),
                        ];

                        super(options, blocks);
                    }
                }

                beforeEach(() => {
                    this.cls = AbstractConditionBlock;
                    inst = new this.cls({
                        verb: "ACB",
                    });
                });

                it("instanceof of Block", () => {
                    assert.instanceOf(inst, Block);
                });

                describe("_condition()", () => {
                    it("adds to list", () => {
                        inst._condition("a = 1");
                        inst._condition("b = 2 OR c = 3");

                        assert.same(
                            [
                                {
                                    expr: "a = 1",
                                    values: [],
                                },
                                {
                                    expr: "b = 2 OR c = 3",
                                    values: [],
                                },
                            ],
                            inst._conditions
                        );
                    });

                    it("sanitizes inputs", () => {
                        const sanitizeFieldSpy = mocker.stub(
                            this.cls.prototype,
                            "_sanitizeExpression",
                            () => "_c"
                        );

                        inst._condition("a = 1");

                        assert.ok(sanitizeFieldSpy.calledWithExactly("a = 1"));

                        assert.same(
                            [
                                {
                                    expr: "_c",
                                    values: [],
                                },
                            ],
                            inst._conditions
                        );
                    });

                    describe("_toParamString()", () => {
                        it("output nothing if no conditions set", () => {
                            assert.same(inst._toParamString(), {
                                text: "",
                                values: [],
                            });
                        });

                        describe("output QueryBuilder ", () => {
                            beforeEach(() => {
                                const subquery = new MockSelectWithCondition();
                                subquery
                                    .field("col1")
                                    .from("table1")
                                    .mockCondition("field1 = ?", 10);
                                inst._condition("a in ?", subquery);
                                inst._condition("b = ? OR c = ?", 2, 3);
                                return inst._condition("d in ?", [4, 5, 6]);
                            });
                            it("non-parameterized", () => {
                                assert.same(inst._toParamString(), {
                                    text: "ACB (a in (SELECT col1 FROM table1 MOCKVERB (field1 = 10))) AND (b = 2 OR c = 3) AND (d in (4, 5, 6))",
                                    values: [],
                                });
                            });
                            it("parameterized", () => {
                                assert.same(
                                    inst._toParamString({
                                        buildParameterized: true,
                                    }),
                                    {
                                        text: "ACB (a in (SELECT col1 FROM table1 MOCKVERB (field1 = ?))) AND (b = ? OR c = ?) AND (d in (?, ?, ?))",
                                        values: [10, 2, 3, 4, 5, 6],
                                    }
                                );
                            });
                        });

                        describe("Fix for #64 - toString() does not change object", () => {
                            beforeEach(() => {
                                inst._condition("a = ?", 1);
                                inst._condition("b = ? OR c = ?", 2, 3);
                                inst._condition("d in ?", [4, 5, 6]);
                                inst._toParamString();
                                return inst._toParamString();
                            });
                            it("non-parameterized", () => {
                                assert.same(inst._toParamString(), {
                                    text: "ACB (a = 1) AND (b = 2 OR c = 3) AND (d in (4, 5, 6))",
                                    values: [],
                                });
                            });
                            it("parameterized", () => {
                                assert.same(
                                    inst._toParamString({
                                        buildParameterized: true,
                                    }),
                                    {
                                        text: "ACB (a = ?) AND (b = ? OR c = ?) AND (d in (?, ?, ?))",
                                        values: [1, 2, 3, 4, 5, 6],
                                    }
                                );
                            });
                        });

                        describe("Fix for #226 - empty expressions", () => {
                            beforeEach(() => {
                                inst._condition("a = ?", 1);
                                return inst._condition(squel.expr());
                            });
                            it("non-parameterized", () => {
                                assert.same(inst._toParamString(), {
                                    text: "ACB (a = 1)",
                                    values: [],
                                });
                            });
                            it("parameterized", () => {
                                assert.same(
                                    inst._toParamString({
                                        buildParameterized: true,
                                    }),
                                    {
                                        text: "ACB (a = ?)",
                                        values: [1],
                                    }
                                );
                            });
                        });
                    });

                    describe("WhereBlock", () => {
                        beforeEach(() => {
                            this.cls = WhereBlock;
                            return (inst = new this.cls());
                        });

                        it("instanceof of AbstractConditionBlock", () => {
                            assert.instanceOf(inst, AbstractConditionBlock);
                        });

                        it("sets verb to WHERE", () => {
                            inst = new this.cls();

                            assert.same("WHERE", inst.options.verb);
                        });

                        describe("_toParamString()", () => {
                            it("output nothing if no conditions set", () => {
                                assert.same(inst._toParamString(), {
                                    text: "",
                                    values: [],
                                });
                            });

                            describe("output", () => {
                                beforeEach(() => {
                                    const subquery = new Select();
                                    subquery
                                        .field("col1")
                                        .from("table1")
                                        .where("field1 = ?", 10);
                                    inst.where("a in ?", subquery);
                                    inst.where("b = ? OR c = ?", 2, 3);
                                    return inst.where("d in ?", [4, 5, 6]);
                                });
                                it("non-parameterized", () => {
                                    assert.same(inst._toParamString(), {
                                        text: "WHERE (a in (SELECT col1 FROM table1 WHERE (field1 = 10))) AND (b = 2 OR c = 3) AND (d in (4, 5, 6))",
                                        values: [],
                                    });
                                });
                                it("parameterized", () => {
                                    assert.same(
                                        inst._toParamString({
                                            buildParameterized: true,
                                        }),
                                        {
                                            text: "WHERE (a in (SELECT col1 FROM table1 WHERE (field1 = ?))) AND (b = ? OR c = ?) AND (d in (?, ?, ?))",
                                            values: [10, 2, 3, 4, 5, 6],
                                        }
                                    );
                                });
                            });
                        });
                    });

                    describe("HavingBlock", () => {
                        beforeEach(() => {
                            this.cls = HavingBlock;
                            return (inst = new this.cls());
                        });

                        it("instanceof of AbstractConditionBlock", () => {
                            assert.instanceOf(inst, AbstractConditionBlock);
                        });

                        it("sets verb", () => {
                            inst = new this.cls();

                            assert.same("HAVING", inst.options.verb);
                        });

                        describe("_toParamString()", () => {
                            it("output nothing if no conditions set", () => {
                                assert.same(inst._toParamString(), {
                                    text: "",
                                    values: [],
                                });
                            });

                            describe("output", () => {
                                beforeEach(() => {
                                    const subquery = new Select();
                                    subquery
                                        .field("col1")
                                        .from("table1")
                                        .where("field1 = ?", 10);
                                    inst.having("a in ?", subquery);
                                    inst.having("b = ? OR c = ?", 2, 3);
                                    return inst.having("d in ?", [4, 5, 6]);
                                });
                                it("non-parameterized", () => {
                                    assert.same(inst._toParamString(), {
                                        text: "HAVING (a in (SELECT col1 FROM table1 WHERE (field1 = 10))) AND (b = 2 OR c = 3) AND (d in (4, 5, 6))",
                                        values: [],
                                    });
                                });
                                it("parameterized", () => {
                                    assert.same(
                                        inst._toParamString({
                                            buildParameterized: true,
                                        }),
                                        {
                                            text: "HAVING (a in (SELECT col1 FROM table1 WHERE (field1 = ?))) AND (b = ? OR c = ?) AND (d in (?, ?, ?))",
                                            values: [10, 2, 3, 4, 5, 6],
                                        }
                                    );
                                });
                            });
                        });
                    });

                    describe("OrderByBlock", () => {
                        beforeEach(() => {
                            this.cls = OrderByBlock;
                            return (inst = new this.cls());
                        });

                        it("instanceof of Block", () => {
                            assert.instanceOf(inst, Block);
                        });

                        describe("order()", () => {
                            it("adds to list", () => {
                                inst.order("field1");
                                inst.order("field2", false);
                                inst.order("field3", true);

                                const expected = [
                                    {
                                        field: "field1",
                                        dir: "ASC",
                                        values: [],
                                    },
                                    {
                                        field: "field2",
                                        dir: "DESC",
                                        values: [],
                                    },
                                    {
                                        field: "field3",
                                        dir: "ASC",
                                        values: [],
                                    },
                                ];

                                assert.same(inst._orders, expected);
                            });

                            it("sanitizes inputs", () => {
                                const sanitizeFieldSpy = mocker.stub(
                                    this.cls.prototype,
                                    "_sanitizeField",
                                    () => "_f"
                                );

                                inst.order("field1");

                                assert.ok(
                                    sanitizeFieldSpy.calledWithExactly("field1")
                                );

                                assert.same(inst._orders, [
                                    { field: "_f", dir: "ASC", values: [] },
                                ]);
                            });

                            it("saves additional values", () => {
                                inst.order("field1", false, 1.2, 4);

                                assert.same(inst._orders, [
                                    {
                                        field: "field1",
                                        dir: "DESC",
                                        values: [1.2, 4],
                                    },
                                ]);
                            });
                        });

                        describe("_toParamString()", () => {
                            it("empty", () => {
                                assert.same(inst._toParamString(), {
                                    text: "",
                                    values: [],
                                });
                            });

                            it("default", () => {
                                beforeEach(() => {
                                    inst.order("field1");
                                    inst.order("field2", false);
                                    return inst.order(
                                        "GET(?, ?)",
                                        true,
                                        2.5,
                                        5
                                    );
                                });
                                it("non-parameterized", () => {
                                    assert.same(inst._toParamString(), {
                                        text: "ORDER BY field1 ASC, field2 DESC, GET(2.5, 5) ASC",
                                        values: [],
                                    });
                                });
                                it("parameterized", () => {
                                    assert.same(
                                        inst._toParamString({
                                            buildParameterized: true,
                                        }),
                                        {
                                            text: "ORDER BY field1 ASC, field2 DESC, GET(?, ?) ASC",
                                            values: [2.5, 5],
                                        }
                                    );
                                });
                            });
                        });

                        describe("JoinBlock", () => {
                            beforeEach(() => {
                                this.cls = JoinBlock;
                                return (inst = new this.cls());
                            });

                            it("instanceof of Block", () => {
                                assert.instanceOf(inst, Block);
                            });

                            describe("join()", () => {
                                it("adds to list", () => {
                                    inst.join("table1");
                                    inst.join("table2", null, "b = 1", "LEFT");
                                    inst.join(
                                        "table3",
                                        "alias3",
                                        "c = 1",
                                        "RIGHT"
                                    );
                                    inst.join(
                                        "table4",
                                        "alias4",
                                        "d = 1",
                                        "OUTER"
                                    );
                                    inst.join(
                                        "table5",
                                        "alias5",
                                        null,
                                        "CROSS"
                                    );

                                    const expected = [
                                        {
                                            type: "INNER",
                                            table: "table1",
                                            alias: null,
                                            condition: null,
                                        },
                                        {
                                            type: "LEFT",
                                            table: "table2",
                                            alias: null,
                                            condition: "b = 1",
                                        },
                                        {
                                            type: "RIGHT",
                                            table: "table3",
                                            alias: "alias3",
                                            condition: "c = 1",
                                        },
                                        {
                                            type: "OUTER",
                                            table: "table4",
                                            alias: "alias4",
                                            condition: "d = 1",
                                        },
                                        {
                                            type: "CROSS",
                                            table: "table5",
                                            alias: "alias5",
                                            condition: null,
                                        },
                                    ];

                                    assert.same(inst._joins, expected);
                                });

                                it("sanitizes inputs", () => {
                                    const sanitizeTableSpy = mocker.stub(
                                        this.cls.prototype,
                                        "_sanitizeTable",
                                        () => "_t"
                                    );
                                    const sanitizeAliasSpy = mocker.stub(
                                        this.cls.prototype,
                                        "_sanitizeTableAlias",
                                        () => "_a"
                                    );
                                    const sanitizeConditionSpy = mocker.stub(
                                        this.cls.prototype,
                                        "_sanitizeExpression",
                                        () => "_c"
                                    );

                                    inst.join("table1", "alias1", "a = 1");

                                    assert.ok(
                                        sanitizeTableSpy.calledWithExactly(
                                            "table1",
                                            true
                                        )
                                    );
                                    assert.ok(
                                        sanitizeAliasSpy.calledWithExactly(
                                            "alias1"
                                        )
                                    );
                                    assert.ok(
                                        sanitizeConditionSpy.calledWithExactly(
                                            "a = 1"
                                        )
                                    );

                                    const expected = [
                                        {
                                            type: "INNER",
                                            table: "_t",
                                            alias: "_a",
                                            condition: "_c",
                                        },
                                    ];

                                    assert.same(inst._joins, expected);
                                });

                                it("nested queries", () => {
                                    const inner1 = squel.select();
                                    const inner2 = squel.select();
                                    const inner3 = squel.select();
                                    const inner4 = squel.select();
                                    const inner5 = squel.select();
                                    const inner6 = squel.select();
                                    inst.join(inner1);
                                    inst.join(inner2, null, "b = 1", "LEFT");
                                    inst.join(
                                        inner3,
                                        "alias3",
                                        "c = 1",
                                        "RIGHT"
                                    );
                                    inst.join(
                                        inner4,
                                        "alias4",
                                        "d = 1",
                                        "OUTER"
                                    );
                                    inst.join(
                                        inner5,
                                        "alias5",
                                        "e = 1",
                                        "FULL"
                                    );
                                    inst.join(inner6, "alias6", null, "CROSS");

                                    const expected = [
                                        {
                                            type: "INNER",
                                            table: inner1,
                                            alias: null,
                                            condition: null,
                                        },
                                        {
                                            type: "LEFT",
                                            table: inner2,
                                            alias: null,
                                            condition: "b = 1",
                                        },
                                        {
                                            type: "RIGHT",
                                            table: inner3,
                                            alias: "alias3",
                                            condition: "c = 1",
                                        },
                                        {
                                            type: "OUTER",
                                            table: inner4,
                                            alias: "alias4",
                                            condition: "d = 1",
                                        },
                                        {
                                            type: "FULL",
                                            table: inner5,
                                            alias: "alias5",
                                            condition: "e = 1",
                                        },
                                        {
                                            type: "CROSS",
                                            table: inner6,
                                            alias: "alias6",
                                            condition: null,
                                        },
                                    ];

                                    assert.same(inst._joins, expected);
                                });
                            });

                            describe("left_join()", () => {
                                it("calls join()", () => {
                                    const joinSpy = mocker.stub(inst, "join");

                                    inst.left_join("t", "a", "c");

                                    assert.ok(joinSpy.calledOnce);
                                    assert.ok(
                                        joinSpy.calledWithExactly(
                                            "t",
                                            "a",
                                            "c",
                                            "LEFT"
                                        )
                                    );
                                });
                            });

                            describe("_toParamString()", () => {
                                it("output nothing if nothing set", () => {
                                    assert.same(inst._toParamString(), {
                                        text: "",
                                        values: [],
                                    });
                                });

                                describe("output JOINs with nested queries", () => {
                                    beforeEach(() => {
                                        const inner2 = squel
                                            .select()
                                            .function("GETDATE(?)", 2);
                                        const inner3 = squel.select().from("3");
                                        const inner4 = squel.select().from("4");
                                        const inner5 = squel.select().from("5");
                                        const expr = squel
                                            .expr()
                                            .and("field1 = ?", 99);

                                        inst.join("table");
                                        inst.join(
                                            inner2,
                                            null,
                                            "b = 1",
                                            "LEFT"
                                        );
                                        inst.join(
                                            inner3,
                                            "alias3",
                                            "c = 1",
                                            "RIGHT"
                                        );
                                        inst.join(
                                            inner4,
                                            "alias4",
                                            "e = 1",
                                            "FULL"
                                        );
                                        return inst.join(
                                            inner5,
                                            "alias5",
                                            expr,
                                            "CROSS"
                                        );
                                    });

                                    it("non-parameterized", () => {
                                        assert.same(inst._toParamString(), {
                                            text: "INNER JOIN table LEFT JOIN (SELECT GETDATE(2)) ON (b = 1) RIGHT JOIN (SELECT * FROM 3) `alias3` ON (c = 1) FULL JOIN (SELECT * FROM 4) `alias4` ON (e = 1) CROSS JOIN (SELECT * FROM 5) `alias5` ON (field1 = 99)",
                                            values: [],
                                        });
                                    });
                                    it("parameterized", () => {
                                        assert.same(
                                            inst._toParamString({
                                                buildParameterized: true,
                                            }),
                                            {
                                                text: "INNER JOIN table LEFT JOIN (SELECT GETDATE(?)) ON (b = 1) RIGHT JOIN (SELECT * FROM 3) `alias3` ON (c = 1) FULL JOIN (SELECT * FROM 4) `alias4` ON (e = 1) CROSS JOIN (SELECT * FROM 5) `alias5` ON (field1 = ?)",
                                                values: [2, 99],
                                            }
                                        );
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
