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

const squel = require("../dist/squel-basic");
const { _, testCreator, assert, expect, should } = require("./testbase");
const test = testCreator();

test["INSERT builder"] = {
    beforeEach() {
        this.func = squel.insert;
        return (this.inst = this.func());
    },

    "instanceof QueryBuilder"() {
        return assert.instanceOf(this.inst, squel.cls.QueryBuilder);
    },

    constructor: {
        "override options"() {
            this.inst = squel.update({
                usingValuePlaceholders: true,
                dummy: true,
            });

            const expectedOptions = _.extend(
                {},
                squel.cls.DefaultQueryBuilderOptions,
                {
                    usingValuePlaceholders: true,
                    dummy: true,
                }
            );

            return Array.from(this.inst.blocks).map((block) =>
                assert.same(
                    _.pick(block.options, _.keys(expectedOptions)),
                    expectedOptions
                )
            );
        },

        "override blocks"() {
            const block = new squel.cls.StringBlock("SELECT");
            this.inst = this.func({}, [block]);
            return assert.same([block], this.inst.blocks);
        },
    },

    "build query": {
        "need to call into() first"() {
            return assert.throws(
                () => this.inst.toString(),
                "into() needs to be called"
            );
        },

        "when set() not called"() {
            return assert.same(
                "INSERT INTO table",
                this.inst.into("table").toString()
            );
        },

        ">> into(table).set(field, null)": {
            beforeEach() {
                return this.inst.into("table").set("field", null);
            },
            toString() {
                return assert.same(
                    this.inst.toString(),
                    "INSERT INTO table (field) VALUES (NULL)"
                );
            },
            toParam() {
                return assert.same(this.inst.toParam(), {
                    text: "INSERT INTO table (field) VALUES (?)",
                    values: [null],
                });
            },
        },

        ">> into(table)": {
            beforeEach() {
                return this.inst.into("table");
            },

            ">> set(field, 1)": {
                beforeEach() {
                    return this.inst.set("field", 1);
                },
                toString() {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field) VALUES (1)"
                    );
                },

                ">> set(field2, 1.2)": {
                    beforeEach() {
                        return this.inst.set("field2", 1.2);
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field, field2) VALUES (1, 1.2)"
                        );
                    },
                },

                '>> set(field2, "str")': {
                    beforeEach() {
                        return this.inst.set("field2", "str");
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field, field2) VALUES (1, 'str')"
                        );
                    },
                    toParam() {
                        return assert.same(this.inst.toParam(), {
                            text: "INSERT INTO table (field, field2) VALUES (?, ?)",
                            values: [1, "str"],
                        });
                    },
                },

                '>> set(field2, "str", { dontQuote: true } )': {
                    beforeEach() {
                        return this.inst.set("field2", "str", {
                            dontQuote: true,
                        });
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field, field2) VALUES (1, str)"
                        );
                    },
                    toParam() {
                        return assert.same(this.inst.toParam(), {
                            text: "INSERT INTO table (field, field2) VALUES (?, ?)",
                            values: [1, "str"],
                        });
                    },
                },

                ">> set(field2, true)": {
                    beforeEach() {
                        return this.inst.set("field2", true);
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field, field2) VALUES (1, TRUE)"
                        );
                    },
                },

                ">> set(field2, null)": {
                    beforeEach() {
                        return this.inst.set("field2", null);
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field, field2) VALUES (1, NULL)"
                        );
                    },
                },

                ">> set(field, query builder)": {
                    beforeEach() {
                        this.subQuery = squel
                            .select()
                            .field("MAX(score)")
                            .from("scores");
                        return this.inst.set("field", this.subQuery);
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field) VALUES ((SELECT MAX(score) FROM scores))"
                        );
                    },
                    toParam() {
                        const parameterized = this.inst.toParam();
                        assert.same(
                            parameterized.text,
                            "INSERT INTO table (field) VALUES ((SELECT MAX(score) FROM scores))"
                        );
                        return assert.same(parameterized.values, []);
                    },
                },

                ">> setFields({field2: 'value2', field3: true })": {
                    beforeEach() {
                        return this.inst.setFields({
                            field2: "value2",
                            field3: true,
                        });
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field, field2, field3) VALUES (1, 'value2', TRUE)"
                        );
                    },
                    toParam() {
                        const parameterized = this.inst.toParam();
                        assert.same(
                            parameterized.text,
                            "INSERT INTO table (field, field2, field3) VALUES (?, ?, ?)"
                        );
                        return assert.same(parameterized.values, [
                            1,
                            "value2",
                            true,
                        ]);
                    },
                },

                ">> setFields({field2: 'value2', field: true })": {
                    beforeEach() {
                        return this.inst.setFields({
                            field2: "value2",
                            field: true,
                        });
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field, field2) VALUES (TRUE, 'value2')"
                        );
                    },
                    toParam() {
                        const parameterized = this.inst.toParam();
                        assert.same(
                            parameterized.text,
                            "INSERT INTO table (field, field2) VALUES (?, ?)"
                        );
                        return assert.same(parameterized.values, [
                            true,
                            "value2",
                        ]);
                    },
                },

                ">> setFields(custom value type)": {
                    beforeEach() {
                        class MyClass {}
                        this.inst.registerValueHandler(MyClass, () => "abcd");
                        return this.inst.setFields({ field: new MyClass() });
                    },
                    toString() {
                        return assert.same(
                            this.inst.toString(),
                            "INSERT INTO table (field) VALUES ((abcd))"
                        );
                    },
                    toParam() {
                        const parameterized = this.inst.toParam();
                        assert.same(
                            parameterized.text,
                            "INSERT INTO table (field) VALUES (?)"
                        );
                        return assert.same(parameterized.values, ["abcd"]);
                    },
                },

                ">> setFieldsRows([{field: 'value2', field2: true },{field: 'value3', field2: 13 }]])":
                    {
                        beforeEach() {
                            return this.inst.setFieldsRows([
                                { field: "value2", field2: true },
                                { field: "value3", field2: 13 },
                            ]);
                        },
                        toString() {
                            return assert.same(
                                this.inst.toString(),
                                "INSERT INTO table (field, field2) VALUES ('value2', TRUE), ('value3', 13)"
                            );
                        },
                        toParam() {
                            const parameterized = this.inst.toParam();
                            assert.same(
                                parameterized.text,
                                "INSERT INTO table (field, field2) VALUES (?, ?), (?, ?)"
                            );
                            return assert.same(parameterized.values, [
                                "value2",
                                true,
                                "value3",
                                13,
                            ]);
                        },
                    },
            },

            "Function values": {
                beforeEach() {
                    return this.inst.set(
                        "field",
                        squel.str("GETDATE(?, ?)", 2014, "feb")
                    );
                },
                toString() {
                    return assert.same(
                        "INSERT INTO table (field) VALUES ((GETDATE(2014, 'feb')))",
                        this.inst.toString()
                    );
                },
                toParam() {
                    return assert.same(
                        {
                            text: "INSERT INTO table (field) VALUES ((GETDATE(?, ?)))",
                            values: [2014, "feb"],
                        },
                        this.inst.toParam()
                    );
                },
            },

            ">> fromQuery([field1, field2], select query)": {
                beforeEach() {
                    return this.inst.fromQuery(
                        ["field1", "field2"],
                        squel.select().from("students").where("a = ?", 2)
                    );
                },
                toString() {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field1, field2) (SELECT * FROM students WHERE (a = 2))"
                    );
                },
                toParam() {
                    const parameterized = this.inst.toParam();
                    assert.same(
                        parameterized.text,
                        "INSERT INTO table (field1, field2) (SELECT * FROM students WHERE (a = ?))"
                    );
                    return assert.same(parameterized.values, [2]);
                },
            },

            ">> setFieldsRows([{field1: 13, field2: 'value2'},{field1: true, field3: 'value4'}])"() {
                return assert.throws(
                    () =>
                        this.inst
                            .setFieldsRows([
                                { field1: 13, field2: "value2" },
                                { field1: true, field3: "value4" },
                            ])
                            .toString(),
                    "All fields in subsequent rows must match the fields in the first row"
                );
            },
        },
    },

    "dontQuote and replaceSingleQuotes set(field2, \"ISNULL('str', str)\", { dontQuote: true })":
        {
            beforeEach() {
                this.inst = squel.insert({ replaceSingleQuotes: true });
                this.inst.into("table").set("field", 1);
                return this.inst.set("field2", "ISNULL('str', str)", {
                    dontQuote: true,
                });
            },
            toString() {
                return assert.same(
                    this.inst.toString(),
                    "INSERT INTO table (field, field2) VALUES (1, ISNULL('str', str))"
                );
            },
            toParam() {
                return assert.same(this.inst.toParam(), {
                    text: "INSERT INTO table (field, field2) VALUES (?, ?)",
                    values: [1, "ISNULL('str', str)"],
                });
            },
        },

    "fix for #225 - autoquoting field names"() {
        this.inst = squel
            .insert({ autoQuoteFieldNames: true })
            .into("users")
            .set("active", 1)
            .set("regular", 0)
            .set("moderator", 1);

        return assert.same(this.inst.toParam(), {
            text: "INSERT INTO users (`active`, `regular`, `moderator`) VALUES (?, ?, ?)",
            values: [1, 0, 1],
        });
    },

    cloning() {
        const newinst = this.inst.into("students").set("field", 1).clone();
        newinst.set("field", 2).set("field2", true);

        assert.same(
            "INSERT INTO students (field) VALUES (1)",
            this.inst.toString()
        );
        return assert.same(
            "INSERT INTO students (field, field2) VALUES (2, TRUE)",
            newinst.toString()
        );
    },
};

if (typeof module !== "undefined" && module !== null) {
    module.exports[require("path").basename(__filename)] = test;
}
