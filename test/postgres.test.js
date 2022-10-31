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

let squel = undefined;
const { _, testCreator, assert, expect, should } = require("./testbase");
const test = testCreator();

test["Postgres flavour"] = {
    beforeEach() {
        delete require.cache[require.resolve("../dist/squel")];
        squel = require("../dist/squel");
        return (squel = squel.useFlavour("postgres"));
    },

    "INSERT builder": {
        beforeEach() {
            return (this.inst = squel.insert());
        },

        '>> into(table).set(field, 1).set(field,2).onConflict("field", {field2:2})':
            {
                beforeEach() {
                    return this.inst
                        .into("table")
                        .set("field", 1)
                        .set("field2", 2)
                        .onConflict("field", { field2: 2 });
                },
                toString() {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT (field) DO UPDATE SET field2 = 2"
                    );
                },
            },

        '>> into(table).set(field, 1).set(field,2).onConflict("field")': {
            beforeEach() {
                return this.inst
                    .into("table")
                    .set("field", 1)
                    .set("field2", 2)
                    .onConflict("field");
            },
            toString() {
                return assert.same(
                    this.inst.toString(),
                    "INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT (field) DO NOTHING"
                );
            },
        },

        '>> into(table).set(field, 1).set(field,2).onConflict(["field", "field2"], {field3:3})':
            {
                beforeEach() {
                    return this.inst
                        .into("table")
                        .set("field", 1)
                        .set("field2", 2)
                        .onConflict(["field", "field2"], { field3: 3 });
                },
                toString() {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT (field, field2) DO UPDATE SET field3 = 3"
                    );
                },
            },

        '>> into(table).set(field, 1).set(field,2).onConflict(["field", "field2"])':
            {
                beforeEach() {
                    return this.inst
                        .into("table")
                        .set("field", 1)
                        .set("field2", 2)
                        .onConflict("field");
                },
                toString() {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT (field) DO NOTHING"
                    );
                },
            },

        ">> into(table).set(field, 1).set(field,2).onConflict()": {
            beforeEach() {
                return this.inst
                    .into("table")
                    .set("field", 1)
                    .set("field2", 2)
                    .onConflict();
            },
            toString() {
                return assert.same(
                    this.inst.toString(),
                    "INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT DO NOTHING"
                );
            },
        },

        '>> into(table).set(field, 1).returning("*")': {
            beforeEach() {
                return this.inst.into("table").set("field", 1).returning("*");
            },
            toString() {
                return assert.same(
                    this.inst.toString(),
                    "INSERT INTO table (field) VALUES (1) RETURNING *"
                );
            },
        },

        '>> into(table).set(field, 1).returning("id")': {
            beforeEach() {
                return this.inst.into("table").set("field", 1).returning("id");
            },
            toString() {
                return assert.same(
                    this.inst.toString(),
                    "INSERT INTO table (field) VALUES (1) RETURNING id"
                );
            },
        },

        '>> into(table).set(field, 1).returning("id").returning("id")': {
            beforeEach() {
                return this.inst
                    .into("table")
                    .set("field", 1)
                    .returning("id")
                    .returning("id");
            },
            toString() {
                return assert.same(
                    this.inst.toString(),
                    "INSERT INTO table (field) VALUES (1) RETURNING id"
                );
            },
        },

        '>> into(table).set(field, 1).returning("id").returning("name", "alias")':
            {
                beforeEach() {
                    return this.inst
                        .into("table")
                        .set("field", 1)
                        .returning("id")
                        .returning("name", "alias");
                },
                toString() {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field) VALUES (1) RETURNING id, name AS alias"
                    );
                },
            },

        '>> into(table).set(field, 1).returning(squel.str("id < ?", 100), "under100")':
            {
                beforeEach() {
                    return this.inst
                        .into("table")
                        .set("field", 1)
                        .returning(squel.str("id < ?", 100), "under100");
                },
                toString() {
                    return assert.same(
                        this.inst.toString(),
                        "INSERT INTO table (field) VALUES (1) RETURNING (id < 100) AS under100"
                    );
                },
                toParam() {
                    return assert.same(this.inst.toParam(), {
                        text: "INSERT INTO table (field) VALUES ($1) RETURNING (id < $2) AS under100",
                        values: [1, 100],
                    });
                },
            },

        ">> into(table).set(field, 1).with(alias, table)": {
            beforeEach() {
                return this.inst
                    .into("table")
                    .set("field", 1)
                    .with(
                        "alias",
                        squel.select().from("table").where("field = ?", 2)
                    );
            },
            toString() {
                return assert.same(
                    this.inst.toString(),
                    "WITH alias AS (SELECT * FROM table WHERE (field = 2)) INSERT INTO table (field) VALUES (1)"
                );
            },
            toParam() {
                return assert.same(this.inst.toParam(), {
                    text: "WITH alias AS (SELECT * FROM table WHERE (field = $1)) INSERT INTO table (field) VALUES ($2)",
                    values: [2, 1],
                });
            },
        },
    },

    "UPDATE builder": {
        beforeEach() {
            return (this.upd = squel.update());
        },

        '>> table(table).set(field, 1).returning("*")': {
            beforeEach() {
                return this.upd.table("table").set("field", 1).returning("*");
            },
            toString() {
                return assert.same(
                    this.upd.toString(),
                    "UPDATE table SET field = 1 RETURNING *"
                );
            },
        },

        '>> table(table).set(field, 1).returning("field")': {
            beforeEach() {
                return this.upd
                    .table("table")
                    .set("field", 1)
                    .returning("field");
            },
            toString() {
                return assert.same(
                    this.upd.toString(),
                    "UPDATE table SET field = 1 RETURNING field"
                );
            },
        },

        '>> table(table).set(field, 1).returning("name", "alias")': {
            beforeEach() {
                return this.upd
                    .table("table")
                    .set("field", 1)
                    .returning("name", "alias");
            },
            toString() {
                return assert.same(
                    this.upd.toString(),
                    "UPDATE table SET field = 1 RETURNING name AS alias"
                );
            },
        },

        ">> table(table).set(field, 1).from(table2)": {
            beforeEach() {
                return this.upd.table("table").set("field", 1).from("table2");
            },
            toString() {
                return assert.same(
                    this.upd.toString(),
                    "UPDATE table SET field = 1 FROM table2"
                );
            },
        },

        ">> table(table).set(field, 1).with(alias, table)": {
            beforeEach() {
                return this.upd
                    .table("table")
                    .set("field", 1)
                    .with(
                        "alias",
                        squel.select().from("table").where("field = ?", 2)
                    );
            },
            toString() {
                return assert.same(
                    this.upd.toString(),
                    "WITH alias AS (SELECT * FROM table WHERE (field = 2)) UPDATE table SET field = 1"
                );
            },
            toParam() {
                return assert.same(this.upd.toParam(), {
                    text: "WITH alias AS (SELECT * FROM table WHERE (field = $1)) UPDATE table SET field = $2",
                    values: [2, 1],
                });
            },
        },
    },

    "DELETE builder": {
        beforeEach() {
            return (this.del = squel.delete());
        },

        '>> from(table).where(field = 1).returning("*")': {
            beforeEach() {
                return this.del.from("table").where("field = 1").returning("*");
            },
            toString() {
                return assert.same(
                    this.del.toString(),
                    "DELETE FROM table WHERE (field = 1) RETURNING *"
                );
            },
        },

        '>> from(table).where(field = 1).returning("field")': {
            beforeEach() {
                return this.del
                    .from("table")
                    .where("field = 1")
                    .returning("field");
            },
            toString() {
                return assert.same(
                    this.del.toString(),
                    "DELETE FROM table WHERE (field = 1) RETURNING field"
                );
            },
        },

        '>> from(table).where(field = 1).returning("field", "f")': {
            beforeEach() {
                return this.del
                    .from("table")
                    .where("field = 1")
                    .returning("field", "f");
            },
            toString() {
                return assert.same(
                    this.del.toString(),
                    "DELETE FROM table WHERE (field = 1) RETURNING field AS f"
                );
            },
        },

        ">> from(table).where(field = 1).with(alias, table)": {
            beforeEach() {
                return this.del
                    .from("table")
                    .where("field = ?", 1)
                    .with(
                        "alias",
                        squel.select().from("table").where("field = ?", 2)
                    );
            },
            toString() {
                return assert.same(
                    this.del.toString(),
                    "WITH alias AS (SELECT * FROM table WHERE (field = 2)) DELETE FROM table WHERE (field = 1)"
                );
            },
            toParam() {
                return assert.same(this.del.toParam(), {
                    text: "WITH alias AS (SELECT * FROM table WHERE (field = $1)) DELETE FROM table WHERE (field = $2)",
                    values: [2, 1],
                });
            },
        },
    },

    "SELECT builder": {
        beforeEach() {
            return (this.sel = squel.select());
        },
        select: {
            ">> from(table).where(field = 1)": {
                beforeEach() {
                    return this.sel
                        .field("field1")
                        .from("table1")
                        .where("field1 = 1");
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "SELECT field1 FROM table1 WHERE (field1 = 1)"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "SELECT field1 FROM table1 WHERE (field1 = 1)",
                        values: [],
                    });
                },
            },

            ">> from(table).where(field = ?, 2)": {
                beforeEach() {
                    return this.sel
                        .field("field1")
                        .from("table1")
                        .where("field1 = ?", 2);
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "SELECT field1 FROM table1 WHERE (field1 = 2)"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "SELECT field1 FROM table1 WHERE (field1 = $1)",
                        values: [2],
                    });
                },
            },
        },

        "distinct queries": {
            beforeEach() {
                return this.sel.fields(["field1", "field2"]).from("table1");
            },

            ">> from(table).distinct()": {
                beforeEach() {
                    return this.sel.distinct();
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "SELECT DISTINCT field1, field2 FROM table1"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "SELECT DISTINCT field1, field2 FROM table1",
                        values: [],
                    });
                },
            },

            ">> from(table).distinct(field1)": {
                beforeEach() {
                    return this.sel.distinct("field1");
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "SELECT DISTINCT ON (field1) field1, field2 FROM table1"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "SELECT DISTINCT ON (field1) field1, field2 FROM table1",
                        values: [],
                    });
                },
            },

            ">> from(table).distinct(field1, field2)": {
                beforeEach() {
                    return this.sel.distinct("field1", "field2");
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "SELECT DISTINCT ON (field1, field2) field1, field2 FROM table1"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "SELECT DISTINCT ON (field1, field2) field1, field2 FROM table1",
                        values: [],
                    });
                },
            },
        },

        "cte queries": {
            beforeEach() {
                this.sel = squel.select();
                this.sel2 = squel.select();
                return (this.sel3 = squel.select());
            },

            ">> query1.with(alias, query2)": {
                beforeEach() {
                    this.sel.from("table1").where("field1 = ?", 1);
                    this.sel2.from("table2").where("field2 = ?", 2);
                    return this.sel.with("someAlias", this.sel2);
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "WITH someAlias AS (SELECT * FROM table2 WHERE (field2 = 2)) SELECT * FROM table1 WHERE (field1 = 1)"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "WITH someAlias AS (SELECT * FROM table2 WHERE (field2 = $1)) SELECT * FROM table1 WHERE (field1 = $2)",
                        values: [2, 1],
                    });
                },
            },

            ">> query1.with(alias1, query2).with(alias2, query2)": {
                beforeEach() {
                    this.sel.from("table1").where("field1 = ?", 1);
                    this.sel2.from("table2").where("field2 = ?", 2);
                    this.sel3.from("table3").where("field3 = ?", 3);
                    return this.sel
                        .with("someAlias", this.sel2)
                        .with("anotherAlias", this.sel3);
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "WITH someAlias AS (SELECT * FROM table2 WHERE (field2 = 2)), anotherAlias AS (SELECT * FROM table3 WHERE (field3 = 3)) SELECT * FROM table1 WHERE (field1 = 1)"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "WITH someAlias AS (SELECT * FROM table2 WHERE (field2 = $1)), anotherAlias AS (SELECT * FROM table3 WHERE (field3 = $2)) SELECT * FROM table1 WHERE (field1 = $3)",
                        values: [2, 3, 1],
                    });
                },
            },
        },

        "union queries": {
            beforeEach() {
                this.sel = squel.select();
                return (this.sel2 = squel.select());
            },

            ">> query1.union(query2)": {
                beforeEach() {
                    this.sel
                        .field("field1")
                        .from("table1")
                        .where("field1 = ?", 3);
                    this.sel2
                        .field("field1")
                        .from("table1")
                        .where("field1 < ?", 10);
                    return this.sel.union(this.sel2);
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "SELECT field1 FROM table1 WHERE (field1 = 3) UNION (SELECT field1 FROM table1 WHERE (field1 < 10))"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "SELECT field1 FROM table1 WHERE (field1 = $1) UNION (SELECT field1 FROM table1 WHERE (field1 < $2))",
                        values: [3, 10],
                    });
                },
            },

            ">> query1.union_all(query2)": {
                beforeEach() {
                    this.sel
                        .field("field1")
                        .from("table1")
                        .where("field1 = ?", 3);
                    this.sel2
                        .field("field1")
                        .from("table1")
                        .where("field1 < ?", 10);
                    return this.sel.union_all(this.sel2);
                },
                toString() {
                    return assert.same(
                        this.sel.toString(),
                        "SELECT field1 FROM table1 WHERE (field1 = 3) UNION ALL (SELECT field1 FROM table1 WHERE (field1 < 10))"
                    );
                },
                toParam() {
                    return assert.same(this.sel.toParam(), {
                        text: "SELECT field1 FROM table1 WHERE (field1 = $1) UNION ALL (SELECT field1 FROM table1 WHERE (field1 < $2))",
                        values: [3, 10],
                    });
                },
            },
        },
    },

    "Default query builder options"() {
        return assert.same(
            {
                replaceSingleQuotes: false,
                singleQuoteReplacement: "''",
                autoQuoteTableNames: false,
                autoQuoteFieldNames: false,
                autoQuoteAliasNames: false,
                useAsForTableAliasNames: true,
                nameQuoteCharacter: "`",
                tableAliasQuoteCharacter: "`",
                fieldAliasQuoteCharacter: '"',
                valueHandlers: [],
                parameterCharacter: "?",
                numberedParameters: true,
                numberedParametersPrefix: "$",
                numberedParametersStartAt: 1,
                separator: " ",
                stringFormatter: null,
                rawNesting: false,
            },
            squel.cls.DefaultQueryBuilderOptions
        );
    },
};

if (typeof module !== "undefined" && module !== null) {
    module.exports[require("path").basename(__filename)] = test;
}
