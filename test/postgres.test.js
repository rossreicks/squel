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

xdescribe('Postgres flavour', () => {
    let testContext;

    beforeEach(() => {
        testContext = {};
    });

    beforeEach(() => {
        delete require.cache[require.resolve('../dist/squel')];
        squel = require('../dist/squel');

        return (squel = squel.useFlavour('postgres'));
    });

    describe('INSERT builder', () => {
        beforeEach(() => {
            return (testContext.inst = squel.insert());
        });

        describe('>> into(table).set(field, 1).set(field,2).onConflict("field", {field2:2})', () => {
            beforeEach(() => {
                return testContext.inst
                    .into('table')
                    .set('field', 1)
                    .set('field2', 2)
                    .onConflict('field', { field2: 2 });
            });
            it('toString', () => {
                return assert.same(
                    testContext.inst.toString(),
                    'INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT (field) DO UPDATE SET field2 = 2'
                );
            });
        });

        describe('>> into(table).set(field, 1).set(field,2).onConflict("field")', () => {
            beforeEach(() => {
                return testContext.inst.into('table').set('field', 1).set('field2', 2).onConflict('field');
            });
            it('toString', () => {
                return assert.same(
                    testContext.inst.toString(),
                    'INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT (field) DO NOTHING'
                );
            });
        });

        describe('>> into(table).set(field, 1).set(field,2).onConflict(["field", "field2"], {field3:3})', () => {
            beforeEach(() => {
                return testContext.inst
                    .into('table')
                    .set('field', 1)
                    .set('field2', 2)
                    .onConflict(['field', 'field2'], { field3: 3 });
            });
            it('toString', () => {
                return assert.same(
                    testContext.inst.toString(),
                    'INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT (field, field2) DO UPDATE SET field3 = 3'
                );
            });
        });

        describe('>> into(table).set(field, 1).set(field,2).onConflict(["field", "field2"])', () => {
            beforeEach(() => {
                return testContext.inst.into('table').set('field', 1).set('field2', 2).onConflict('field');
            });
            it('toString', () => {
                return assert.same(
                    testContext.inst.toString(),
                    'INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT (field) DO NOTHING'
                );
            });
        });

        describe('>> into(table).set(field, 1).set(field,2).onConflict()', () => {
            beforeEach(() => {
                return testContext.inst.into('table').set('field', 1).set('field2', 2).onConflict();
            });
            it('toString', () => {
                return assert.same(
                    testContext.inst.toString(),
                    'INSERT INTO table (field, field2) VALUES (1, 2) ON CONFLICT DO NOTHING'
                );
            });
        });

        describe('>> into(table).set(field, 1).returning("*")', () => {
            beforeEach(() => {
                return testContext.inst.into('table').set('field', 1).returning('*');
            });
            it('toString', () => {
                return assert.same(testContext.inst.toString(), 'INSERT INTO table (field) VALUES (1) RETURNING *');
            });
        });

        describe('>> into(table).set(field, 1).returning("id")', () => {
            beforeEach(() => {
                return testContext.inst.into('table').set('field', 1).returning('id');
            });
            it('toString', () => {
                return assert.same(testContext.inst.toString(), 'INSERT INTO table (field) VALUES (1) RETURNING id');
            });
        });

        describe('>> into(table).set(field, 1).returning("id").returning("id")', () => {
            beforeEach(() => {
                return testContext.inst.into('table').set('field', 1).returning('id').returning('id');
            });
            it('toString', () => {
                return assert.same(testContext.inst.toString(), 'INSERT INTO table (field) VALUES (1) RETURNING id');
            });
        });

        describe('>> into(table).set(field, 1).returning("id").returning("name", "alias")', () => {
            beforeEach(() => {
                return testContext.inst.into('table').set('field', 1).returning('id').returning('name', 'alias');
            });
            it('toString', () => {
                return assert.same(
                    testContext.inst.toString(),
                    'INSERT INTO table (field) VALUES (1) RETURNING id, name AS alias'
                );
            });
        });

        describe('>> into(table).set(field, 1).returning(squel.str("id < ?", 100), "under100")', () => {
            beforeEach(() => {
                return testContext.inst.into('table').set('field', 1).returning(squel.str('id < ?', 100), 'under100');
            });
            it('toString', () => {
                return assert.same(
                    testContext.inst.toString(),
                    'INSERT INTO table (field) VALUES (1) RETURNING (id < 100) AS under100'
                );
            });
            it('toParam', () => {
                return assert.same(testContext.inst.toParam(), {
                    text: 'INSERT INTO table (field) VALUES ($1) RETURNING (id < $2) AS under100',
                    values: [1, 100],
                });
            });
        });

        describe('>> into(table).set(field, 1).with(alias, table)', () => {
            beforeEach(() => {
                return testContext.inst
                    .into('table')
                    .set('field', 1)
                    .with('alias', squel.select().from('table').where('field = ?', 2));
            });
            it('toString', () => {
                return assert.same(
                    testContext.inst.toString(),
                    'WITH alias AS (SELECT * FROM table WHERE (field = 2)) INSERT INTO table (field) VALUES (1)'
                );
            });
            it('toParam', () => {
                return assert.same(testContext.inst.toParam(), {
                    text: 'WITH alias AS (SELECT * FROM table WHERE (field = $1)) INSERT INTO table (field) VALUES ($2)',
                    values: [2, 1],
                });
            });
        });
    });

    describe('UPDATE builder', () => {
        beforeEach(() => {
            return (testContext.upd = squel.update());
        });

        describe('>> table(table).set(field, 1).returning("*")', () => {
            beforeEach(() => {
                return testContext.upd.table('table').set('field', 1).returning('*');
            });
            it('toString', () => {
                return assert.same(testContext.upd.toString(), 'UPDATE table SET field = 1 RETURNING *');
            });
        });

        describe('>> table(table).set(field, 1).returning("field")', () => {
            beforeEach(() => {
                return testContext.upd.table('table').set('field', 1).returning('field');
            });
            it('toString', () => {
                return assert.same(testContext.upd.toString(), 'UPDATE table SET field = 1 RETURNING field');
            });
        });

        describe('>> table(table).set(field, 1).returning("name", "alias")', () => {
            beforeEach(() => {
                return testContext.upd.table('table').set('field', 1).returning('name', 'alias');
            });
            it('toString', () => {
                return assert.same(testContext.upd.toString(), 'UPDATE table SET field = 1 RETURNING name AS alias');
            });
        });

        describe('>> table(table).set(field, 1).from(table2)', () => {
            beforeEach(() => {
                return testContext.upd.table('table').set('field', 1).from('table2');
            });
            it('toString', () => {
                return assert.same(testContext.upd.toString(), 'UPDATE table SET field = 1 FROM table2');
            });
        });

        describe('>> table(table).set(field, 1).with(alias, table)', () => {
            beforeEach(() => {
                return testContext.upd
                    .table('table')
                    .set('field', 1)
                    .with('alias', squel.select().from('table').where('field = ?', 2));
            });
            it('toString', () => {
                return assert.same(
                    testContext.upd.toString(),
                    'WITH alias AS (SELECT * FROM table WHERE (field = 2)) UPDATE table SET field = 1'
                );
            });
            it('toParam', () => {
                return assert.same(testContext.upd.toParam(), {
                    text: 'WITH alias AS (SELECT * FROM table WHERE (field = $1)) UPDATE table SET field = $2',
                    values: [2, 1],
                });
            });
        });
    });

    describe('DELETE builder', () => {
        beforeEach(() => {
            return (testContext.del = squel.delete());
        });

        describe('>> from(table).where(field = 1).returning("*")', () => {
            beforeEach(() => {
                return testContext.del.from('table').where('field = 1').returning('*');
            });
            it('toString', () => {
                return assert.same(testContext.del.toString(), 'DELETE FROM table WHERE (field = 1) RETURNING *');
            });
        });

        describe('>> from(table).where(field = 1).returning("field")', () => {
            beforeEach(() => {
                return testContext.del.from('table').where('field = 1').returning('field');
            });
            it('toString', () => {
                return assert.same(testContext.del.toString(), 'DELETE FROM table WHERE (field = 1) RETURNING field');
            });
        });

        describe('>> from(table).where(field = 1).returning("field", "f")', () => {
            beforeEach(() => {
                return testContext.del.from('table').where('field = 1').returning('field', 'f');
            });
            it('toString', () => {
                return assert.same(
                    testContext.del.toString(),
                    'DELETE FROM table WHERE (field = 1) RETURNING field AS f'
                );
            });
        });

        describe('>> from(table).where(field = 1).with(alias, table)', () => {
            beforeEach(() => {
                return testContext.del
                    .from('table')
                    .where('field = ?', 1)
                    .with('alias', squel.select().from('table').where('field = ?', 2));
            });
            it('toString', () => {
                return assert.same(
                    testContext.del.toString(),
                    'WITH alias AS (SELECT * FROM table WHERE (field = 2)) DELETE FROM table WHERE (field = 1)'
                );
            });
            it('toParam', () => {
                return assert.same(testContext.del.toParam(), {
                    text: 'WITH alias AS (SELECT * FROM table WHERE (field = $1)) DELETE FROM table WHERE (field = $2)',
                    values: [2, 1],
                });
            });
        });
    });

    describe('SELECT builder', () => {
        beforeEach(() => {
            return (testContext.sel = squel.select());
        });
        describe('select', () => {
            describe('>> from(table).where(field = 1)', () => {
                beforeEach(() => {
                    return testContext.sel.field('field1').from('table1').where('field1 = 1');
                });
                it('toString', () => {
                    return assert.same(testContext.sel.toString(), 'SELECT field1 FROM table1 WHERE (field1 = 1)');
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'SELECT field1 FROM table1 WHERE (field1 = 1)',
                        values: [],
                    });
                });
            });

            describe('>> from(table).where(field = ?, 2)', () => {
                beforeEach(() => {
                    return testContext.sel.field('field1').from('table1').where('field1 = ?', 2);
                });
                it('toString', () => {
                    return assert.same(testContext.sel.toString(), 'SELECT field1 FROM table1 WHERE (field1 = 2)');
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'SELECT field1 FROM table1 WHERE (field1 = $1)',
                        values: [2],
                    });
                });
            });
        });

        describe('distinct queries', () => {
            beforeEach(() => {
                return testContext.sel.fields(['field1', 'field2']).from('table1');
            });

            describe('>> from(table).distinct()', () => {
                beforeEach(() => {
                    return testContext.sel.distinct();
                });
                it('toString', () => {
                    return assert.same(testContext.sel.toString(), 'SELECT DISTINCT field1, field2 FROM table1');
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'SELECT DISTINCT field1, field2 FROM table1',
                        values: [],
                    });
                });
            });

            describe('>> from(table).distinct(field1)', () => {
                beforeEach(() => {
                    return testContext.sel.distinct('field1');
                });
                it('toString', () => {
                    return assert.same(
                        testContext.sel.toString(),
                        'SELECT DISTINCT ON (field1) field1, field2 FROM table1'
                    );
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'SELECT DISTINCT ON (field1) field1, field2 FROM table1',
                        values: [],
                    });
                });
            });

            describe('>> from(table).distinct(field1, field2)', () => {
                beforeEach(() => {
                    return testContext.sel.distinct('field1', 'field2');
                });
                it('toString', () => {
                    return assert.same(
                        testContext.sel.toString(),
                        'SELECT DISTINCT ON (field1, field2) field1, field2 FROM table1'
                    );
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'SELECT DISTINCT ON (field1, field2) field1, field2 FROM table1',
                        values: [],
                    });
                });
            });
        });

        describe('cte queries', () => {
            beforeEach(() => {
                testContext.sel = squel.select();
                testContext.sel2 = squel.select();

                return (testContext.sel3 = squel.select());
            });

            describe('>> query1.with(alias, query2)', () => {
                beforeEach(() => {
                    testContext.sel.from('table1').where('field1 = ?', 1);
                    testContext.sel2.from('table2').where('field2 = ?', 2);

                    return testContext.sel.with('someAlias', testContext.sel2);
                });
                it('toString', () => {
                    return assert.same(
                        testContext.sel.toString(),
                        'WITH someAlias AS (SELECT * FROM table2 WHERE (field2 = 2)) SELECT * FROM table1 WHERE (field1 = 1)'
                    );
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'WITH someAlias AS (SELECT * FROM table2 WHERE (field2 = $1)) SELECT * FROM table1 WHERE (field1 = $2)',
                        values: [2, 1],
                    });
                });
            });

            describe('>> query1.with(alias1, query2).with(alias2, query2)', () => {
                beforeEach(() => {
                    testContext.sel.from('table1').where('field1 = ?', 1);
                    testContext.sel2.from('table2').where('field2 = ?', 2);
                    testContext.sel3.from('table3').where('field3 = ?', 3);

                    return testContext.sel.with('someAlias', testContext.sel2).with('anotherAlias', testContext.sel3);
                });
                it('toString', () => {
                    return assert.same(
                        testContext.sel.toString(),
                        'WITH someAlias AS (SELECT * FROM table2 WHERE (field2 = 2)), anotherAlias AS (SELECT * FROM table3 WHERE (field3 = 3)) SELECT * FROM table1 WHERE (field1 = 1)'
                    );
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'WITH someAlias AS (SELECT * FROM table2 WHERE (field2 = $1)), anotherAlias AS (SELECT * FROM table3 WHERE (field3 = $2)) SELECT * FROM table1 WHERE (field1 = $3)',
                        values: [2, 3, 1],
                    });
                });
            });
        });

        describe('union queries', () => {
            beforeEach(() => {
                testContext.sel = squel.select();

                return (testContext.sel2 = squel.select());
            });

            describe('>> query1.union(query2)', () => {
                beforeEach(() => {
                    testContext.sel.field('field1').from('table1').where('field1 = ?', 3);
                    testContext.sel2.field('field1').from('table1').where('field1 < ?', 10);

                    return testContext.sel.union(testContext.sel2);
                });
                it('toString', () => {
                    return assert.same(
                        testContext.sel.toString(),
                        'SELECT field1 FROM table1 WHERE (field1 = 3) UNION (SELECT field1 FROM table1 WHERE (field1 < 10))'
                    );
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'SELECT field1 FROM table1 WHERE (field1 = $1) UNION (SELECT field1 FROM table1 WHERE (field1 < $2))',
                        values: [3, 10],
                    });
                });
            });

            describe('>> query1.union_all(query2)', () => {
                beforeEach(() => {
                    testContext.sel.field('field1').from('table1').where('field1 = ?', 3);
                    testContext.sel2.field('field1').from('table1').where('field1 < ?', 10);

                    return testContext.sel.union_all(testContext.sel2);
                });
                it('toString', () => {
                    return assert.same(
                        testContext.sel.toString(),
                        'SELECT field1 FROM table1 WHERE (field1 = 3) UNION ALL (SELECT field1 FROM table1 WHERE (field1 < 10))'
                    );
                });
                it('toParam', () => {
                    return assert.same(testContext.sel.toParam(), {
                        text: 'SELECT field1 FROM table1 WHERE (field1 = $1) UNION ALL (SELECT field1 FROM table1 WHERE (field1 < $2))',
                        values: [3, 10],
                    });
                });
            });
        });
    });

    it('Default query builder options', () => {
        return assert.same(
            {
                replaceSingleQuotes: false,
                singleQuoteReplacement: "''",
                autoQuoteTableNames: false,
                autoQuoteFieldNames: false,
                autoQuoteAliasNames: false,
                useAsForTableAliasNames: true,
                nameQuoteCharacter: '`',
                tableAliasQuoteCharacter: '`',
                fieldAliasQuoteCharacter: '"',
                valueHandlers: [],
                parameterCharacter: '?',
                numberedParameters: true,
                numberedParametersPrefix: '$',
                numberedParametersStartAt: 1,
                separator: ' ',
                stringFormatter: null,
                rawNesting: false,
            },
            squel.cls.DefaultQueryBuilderOptions
        );
    });
});
