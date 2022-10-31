/* eslint-disable no-plusplus */
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

import sinon from 'sinon';
import { extend, pick, keys } from 'lodash';
import { squel } from '../src';
import { StringBlock } from '../src/block';
import { DefaultQueryBuilderOptions } from '../src/base-builder';
import { QueryBuilder } from '../src/query-builder';

let mocker;

let inst = squel.insert();

const areSame = function (actual, expected, message) {
    return expect(actual).toEqual(expected);
};

describe('INSERT builder', () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
        inst = squel.insert();
    });

    afterEach(() => {
        mocker.restore();
    });

    it('instanceof QueryBuilder', () => {
        expect(inst).toBeInstanceOf(QueryBuilder);
    });

    describe('constructor', () => {
        it('override options', () => {
            let block;

            let _i;

            let _len;

            inst = squel.update({
                usingValuePlaceholders: true,
                dummy: true,
            });
            const expectedOptions = extend({}, DefaultQueryBuilderOptions, {
                usingValuePlaceholders: true,
                dummy: true,
            });
            const _ref1 = inst.blocks;
            const _results = [];

            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                block = _ref1[_i];
                _results.push(areSame(pick(block.options, keys(expectedOptions)), expectedOptions));
            }
        });

        it('override blocks', () => {
            const block = new StringBlock('SELECT');

            inst = squel.insert({}, [block]);

            return areSame([block], inst.blocks);
        });
    });

    describe('build query', () => {
        it('need to call into() first', () => {
            expect(inst.toString).toThrow();
        });
        it('when set() not called', () => {
            areSame('INSERT INTO table', inst.into('table').toString());
        });

        describe('>> into(table).set(field, null)', () => {
            beforeEach(() => {
                inst.into('table').set('field', null);
            });
            it('toString', () => {
                areSame(inst.toString(), 'INSERT INTO table (field) VALUES (NULL)');
            });

            it('toParam', () => {
                areSame(inst.toParam(), {
                    text: 'INSERT INTO table (field) VALUES (?)',
                    values: [null],
                });
            });
        });

        describe('>> into(table)', () => {
            beforeEach(() => {
                inst.into('table');
            });

            describe('>> set(field, 1)', () => {
                beforeEach(() => inst.set('field', 1));
                it('toString', () => {
                    areSame(inst.toString(), 'INSERT INTO table (field) VALUES (1)');
                });
                describe('>> set(field2, 1.2)', () => {
                    beforeEach(() => inst.set('field2', 1.2));
                    it('toString', () => areSame(inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, 1.2)'));
                });
                describe('>> set(field2, "str")', () => {
                    beforeEach(() => inst.set('field2', 'str'));
                    it('toString', () =>
                        areSame(inst.toString(), "INSERT INTO table (field, field2) VALUES (1, 'str')"));
                    it('toParam', () =>
                        areSame(inst.toParam(), {
                            text: 'INSERT INTO table (field, field2) VALUES (?, ?)',
                            values: [1, 'str'],
                        }));
                });

                describe('>> set(field2, "str", { dontQuote: true } )', () => {
                    beforeEach(() =>
                        inst.set('field2', 'str', {
                            dontQuote: true,
                        })
                    );
                    it('toString', () => {
                        areSame(inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, str)');
                    });

                    it('toParam', () => {
                        areSame(inst.toParam(), {
                            text: 'INSERT INTO table (field, field2) VALUES (?, ?)',
                            values: [1, 'str'],
                        });
                    });
                });
                describe('>> set(field2, true)', () => {
                    beforeEach(() => inst.set('field2', true));
                    it('toString', () =>
                        areSame(inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, TRUE)'));
                });
                describe('>> set(field2, null)', () => {
                    beforeEach(() => inst.set('field2', null));
                    it('toString', () =>
                        areSame(inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, NULL)'));
                });
                describe('>> set(field, query builder)', () => {
                    let subQuery = squel.select();

                    beforeEach(() => {
                        subQuery = squel.select().field('MAX(score)').from('scores');

                        return inst.set('field', subQuery);
                    });
                    it('toString', () =>
                        areSame(inst.toString(), 'INSERT INTO table (field) VALUES ((SELECT MAX(score) FROM scores))'));
                    it('toParam', () => {
                        const parameterized = inst.toParam();

                        areSame(
                            parameterized.text,
                            'INSERT INTO table (field) VALUES ((SELECT MAX(score) FROM scores))'
                        );

                        return areSame(parameterized.values, []);
                    });
                });
                describe(">> setFields({field2: 'value2', field3: true })", () => {
                    beforeEach(() =>
                        inst.setFields({
                            field2: 'value2',
                            field3: true,
                        })
                    );
                    it('toString', () =>
                        areSame(
                            inst.toString(),
                            "INSERT INTO table (field, field2, field3) VALUES (1, 'value2', TRUE)"
                        ));
                    it('toParam', () => {
                        const parameterized = inst.toParam();

                        areSame(parameterized.text, 'INSERT INTO table (field, field2, field3) VALUES (?, ?, ?)');

                        return areSame(parameterized.values, [1, 'value2', true]);
                    });
                });
                describe(">> setFields({field2: 'value2', field: true })", () => {
                    beforeEach(() =>
                        inst.setFields({
                            field2: 'value2',
                            field: true,
                        })
                    );
                    it('toString', () =>
                        areSame(inst.toString(), "INSERT INTO table (field, field2) VALUES (TRUE, 'value2')"));
                    it('toParam', () => {
                        const parameterized = inst.toParam();

                        areSame(parameterized.text, 'INSERT INTO table (field, field2) VALUES (?, ?)');

                        return areSame(parameterized.values, [true, 'value2']);
                    });
                });
                describe('>> setFields(custom value type)', () => {
                    beforeEach(() => {
                        const MyClass = (function () {
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            function InnerClass() {}

                            return InnerClass;
                        })();

                        inst.registerValueHandler(MyClass, () => 'abcd');

                        return inst.setFields({
                            field: new MyClass(),
                        });
                    });

                    it('toString', () => {
                        areSame(inst.toString(), 'INSERT INTO table (field) VALUES ((abcd))');
                    });

                    it('toParam', () => {
                        const parameterized = inst.toParam();

                        areSame(parameterized.text, 'INSERT INTO table (field) VALUES (?)');

                        return areSame(parameterized.values, ['abcd']);
                    });
                });
                describe(">> setFieldsRows([{field: 'value2', field2: true },{field: 'value3', field2: 13 }]])", () => {
                    beforeEach(() =>
                        inst.setFieldsRows([
                            {
                                field: 'value2',
                                field2: true,
                            },
                            {
                                field: 'value3',
                                field2: 13,
                            },
                        ])
                    );
                    it('toString', () =>
                        areSame(
                            inst.toString(),
                            "INSERT INTO table (field, field2) VALUES ('value2', TRUE), ('value3', 13)"
                        ));
                    it('toParam', () => {
                        const parameterized = inst.toParam();

                        areSame(parameterized.text, 'INSERT INTO table (field, field2) VALUES (?, ?), (?, ?)');

                        return areSame(parameterized.values, ['value2', true, 'value3', 13]);
                    });
                });
            });

            describe('Function values', () => {
                beforeEach(() => {
                    inst.set('field', squel.str('GETDATE(?, ?)', 2014, 'feb'));
                });

                it('toString', () => {
                    areSame("INSERT INTO table (field) VALUES ((GETDATE(2014, 'feb')))", inst.toString());
                });

                it('toParam', () => {
                    areSame(
                        {
                            text: 'INSERT INTO table (field) VALUES ((GETDATE(?, ?)))',
                            values: [2014, 'feb'],
                        },
                        inst.toParam()
                    );
                });
            });

            describe('>> fromQuery([field1, field2], select query)', () => {
                beforeEach(() => {
                    inst.fromQuery(['field1', 'field2'], squel.select().from('students').where('a = ?', 2));
                });

                it('toString', () => {
                    areSame(
                        inst.toString(),
                        'INSERT INTO table (field1, field2) (SELECT * FROM students WHERE (a = 2))'
                    );
                });

                it('toParam', () => {
                    const parameterized = inst.toParam();

                    areSame(
                        parameterized.text,
                        'INSERT INTO table (field1, field2) (SELECT * FROM students WHERE (a = ?))'
                    );

                    return areSame(parameterized.values, [2]);
                });

                it(">> setFieldsRows([{field1: 13, field2: 'value2'},{field1: true, field3: 'value4'}])", () => {
                    expect(() =>
                        inst
                            .setFieldsRows([
                                {
                                    field1: 13,
                                    field2: 'value2',
                                },
                                {
                                    field1: true,
                                    field3: 'value4',
                                },
                            ])
                            .toString()
                    ).toThrow();
                });
            });
        });
    });
    describe('dontQuote and replaceSingleQuotes set(field2, "ISNULL(\'str\', str)", { dontQuote: true })', () => {
        beforeEach(() => {
            inst = squel.insert({
                replaceSingleQuotes: true,
            });
            inst.into('table').set('field', 1);

            return inst.set('field2', "ISNULL('str', str)", {
                dontQuote: true,
            });
        });
        it('toString', () => {
            areSame(inst.toString(), "INSERT INTO table (field, field2) VALUES (1, ISNULL('str', str))");
        });
        it('toParam', () => {
            areSame(inst.toParam(), {
                text: 'INSERT INTO table (field, field2) VALUES (?, ?)',
                values: [1, "ISNULL('str', str)"],
            });
        });
    });

    it('fix for #225 - autoquoting field names', () => {
        inst = squel
            .insert({
                autoQuoteFieldNames: true,
            })
            .into('users')
            .set('active', 1)
            .set('regular', 0)
            .set('moderator', 1);

        return areSame(inst.toParam(), {
            text: 'INSERT INTO users (`active`, `regular`, `moderator`) VALUES (?, ?, ?)',
            values: [1, 0, 1],
        });
    });
    it('cloning', () => {
        const newinst = inst.into('students').set('field', 1).clone();

        newinst.set('field', 2).set('field2', true);
        areSame('INSERT INTO students (field) VALUES (1)', inst.toString());

        return areSame('INSERT INTO students (field, field2) VALUES (2, TRUE)', newinst.toString());
    });
});
