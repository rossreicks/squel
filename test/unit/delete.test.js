import sinon from 'sinon';
import { extend, pick, keys } from 'lodash';
import squel from '../../src';
import { StringBlock } from '../../src/block';
import { DefaultQueryBuilderOptions } from '../../src/base-builder';
import { QueryBuilder } from '../../src/query-builder';

let mocker;
let inst = squel.delete();

const areEqual = function (actual, expected, message) {
    expect(actual).toEqual(expected);
};

describe('DELETE builder', () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
        inst = squel.delete();
    });

    afterEach(() => {
        mocker.restore();
    });

    it('instanceof QueryBuilder', () => {
        expect(inst).toBeInstanceOf(QueryBuilder);
    });

    describe('constructor', () => {
        it('override options', () => {
            inst = squel.update({
                usingValuePlaceholders: true,
                dummy: true,
            });

            const expectedOptions = extend({}, DefaultQueryBuilderOptions, {
                usingValuePlaceholders: true,
                dummy: true,
            });

            Array.from(inst.blocks).map((block) =>
                areEqual(pick(block.options, keys(expectedOptions)), expectedOptions)
            );
        });

        it('override blocks', () => {
            const block = new StringBlock('SELECT');

            inst = squel.delete({}, [block]);

            areEqual([block], inst.blocks);
        });
    });

    describe('build query', () => {
        it('no need to call from()', () => {
            inst.toString();
        });

        describe('>> from(table)', () => {
            beforeEach(() => {
                inst.from('table');
            });
            it('toString()', () => {
                areEqual(inst.toString(), 'DELETE FROM table');
            });

            describe('>> table(table2, t2)', () => {
                beforeEach(() => {
                    inst.from('table2', 't2');
                });
                it('toString()', () => {
                    areEqual(inst.toString(), 'DELETE FROM table2 `t2`');
                });

                describe('>> where(a = 1)', () => {
                    beforeEach(() => {
                        inst.where('a = 1');
                    });
                    it('toString()', () => {
                        areEqual(inst.toString(), 'DELETE FROM table2 `t2` WHERE (a = 1)');
                    });

                    describe('>> join(other_table)', () => {
                        beforeEach(() => {
                            inst.join('other_table', 'o', 'o.id = t2.id');
                        });
                        it('toString()', () => {
                            areEqual(
                                inst.toString(),
                                'DELETE FROM table2 `t2` INNER JOIN other_table `o` ON (o.id = t2.id) WHERE (a = 1)'
                            );
                        });

                        describe('>> order(a, true)', () => {
                            beforeEach(() => {
                                inst.order('a', true);
                            });
                            it('toString()', () => {
                                areEqual(
                                    inst.toString(),
                                    'DELETE FROM table2 `t2` INNER JOIN other_table `o` ON (o.id = t2.id) WHERE (a = 1) ORDER BY a ASC'
                                );
                            });

                            describe('>> limit(2)', () => {
                                beforeEach(() => {
                                    inst.limit(2);
                                });
                                it('toString()', () => {
                                    areEqual(
                                        inst.toString(),
                                        'DELETE FROM table2 `t2` INNER JOIN other_table `o` ON (o.id = t2.id) WHERE (a = 1) ORDER BY a ASC LIMIT 2'
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
                inst.target('table1').from('table1').left_join('table2', null, 'table1.a = table2.b').where('c = ?', 3);
            });
            it('toString()', () => {
                areEqual(
                    inst.toString(),
                    'DELETE table1 FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = 3)'
                );
            });
            it('toParam()', () => {
                areEqual(inst.toParam(), {
                    text: 'DELETE table1 FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = ?)',
                    values: [3],
                });
            });

            describe('>> target(table2)', () => {
                beforeEach(() => {
                    inst.target('table2');
                });
                it('toString()', () => {
                    areEqual(
                        inst.toString(),
                        'DELETE table1, table2 FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = 3)'
                    );
                });
                it('toParam()', () => {
                    areEqual(inst.toParam(), {
                        text: 'DELETE table1, table2 FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = ?)',
                        values: [3],
                    });
                });
            });
        });

        describe('>> from(table1).left_join(table2, null, "table1.a = table2.b")', () => {
            beforeEach(() => {
                inst.from('table1').left_join('table2', null, 'table1.a = table2.b').where('c = ?', 3);
            });
            it('toString()', () => {
                areEqual(inst.toString(), 'DELETE FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = 3)');
            });
            it('toParam()', () => {
                areEqual(inst.toParam(), {
                    text: 'DELETE FROM table1 LEFT JOIN table2 ON (table1.a = table2.b) WHERE (c = ?)',
                    values: [3],
                });
            });
        });
    });

    it('cloning()', () => {
        const newinst = inst.from('students').limit(10).clone();

        newinst.limit(20);

        areEqual('DELETE FROM students LIMIT 10', inst.toString());
        areEqual('DELETE FROM students LIMIT 20', newinst.toString());
    });
});
