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

import sinon from 'sinon';
import { extend } from 'lodash';
import { squel } from '../src';
import { BaseBuilder, DefaultQueryBuilderOptions } from '../src/base-builder';

let mocker;
let inst = squel.expr();

const areEqual = function (actual, expected, message) {
    expect(actual).toEqual(expected);
};

describe('Expression builder base class', () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
        inst = squel.expr();
    });

    afterEach(() => {
        mocker.restore();
    });

    it('extends BaseBuilder', () => {
        expect(inst instanceof BaseBuilder).toBeTruthy();
    });

    it('toString() returns empty', () => {
        areEqual('', inst.toString());
    });

    describe('options', () => {
        it('default options', () => {
            areEqual(DefaultQueryBuilderOptions, inst.options);
        });
        it('custom options', () => {
            const e = squel.expr({
                separator: ',asdf',
            });

            const expected = extend({}, DefaultQueryBuilderOptions, {
                separator: ',asdf',
            });

            areEqual(expected, e.options);
        });
    });

    describe('and()', () => {
        it('without an argument throws an error', () => {
            expect(() => inst.and()).toThrow();
        });
        it('with an array throws an error', () => {
            expect(() => inst.and([1])).toThrow();
        });
        it('with an object throws an error', () => {
            expect(() => inst.and(new Object())).toThrow();
        });
        it('with a function throws an error', () => {
            expect(() => inst.and(() => 1)).toThrow();
        });
        it('with an Expression returns object instance', () => {
            areEqual(inst, inst.and(squel.expr()));
        });
        it('with a builder returns object instance', () => {
            areEqual(inst, inst.and(squel.str()));
        });
        it('with a string returns object instance', () => {
            areEqual(inst, inst.and('bla'));
        });
    });

    describe('or()', () => {
        it('without an argument throws an error', () => {
            expect(() => inst.or()).toThrow();
        });
        it('with an array throws an error', () => {
            expect(() => inst.or([1])).toThrow();
        });
        it('with an object throws an error', () => {
            expect(() => inst.or(new Object())).toThrow();
        });
        it('with a function throws an error', () => {
            expect(() => inst.or(() => 1)).toThrow();
        });
        it('with an Expression returns object instance', () => {
            areEqual(inst, inst.or(squel.expr()));
        });
        it('with a builder returns object instance', () => {
            areEqual(inst, inst.or(squel.str()));
        });
        it('with a string returns object instance', () => {
            areEqual(inst, inst.or('bla'));
        });
    });

    describe('and("test = 3")', () => {
        beforeEach(() => {
            return inst.and('test = 3');
        });

        it('>> toString()', () => {
            areEqual(inst.toString(), 'test = 3');
        });

        it('>> toParam()', () => {
            areEqual(inst.toParam(), {
                text: 'test = 3',
                values: [],
            });
        });

        describe('>> and("flight = \'4\'")', () => {
            beforeEach(() => {
                return inst.and("flight = '4'");
            });

            it('>> toString()', () => {
                areEqual(inst.toString(), "test = 3 AND flight = '4'");
            });

            it('>> toParam()', () => {
                areEqual(inst.toParam(), {
                    text: "test = 3 AND flight = '4'",
                    values: [],
                });
            });

            describe('>> or("dummy IN (1,2,3)")', () => {
                beforeEach(() => {
                    return inst.or('dummy IN (1,2,3)');
                });

                it('>> toString()', () => {
                    areEqual(inst.toString(), "test = 3 AND flight = '4' OR dummy IN (1,2,3)");
                });

                it('>> toParam()', () => {
                    areEqual(inst.toParam(), {
                        text: "test = 3 AND flight = '4' OR dummy IN (1,2,3)",
                        values: [],
                    });
                });
            });
        });
    });

    describe('and("test = ?", null)', () => {
        beforeEach(() => {
            return inst.and('test = ?', null);
        });

        it('>> toString()', () => {
            areEqual(inst.toString(), 'test = NULL');
        });

        it('>> toParam()', () => {
            areEqual(inst.toParam(), {
                text: 'test = ?',
                values: [null],
            });
        });
    });

    describe('and("test = ?", 3)', () => {
        beforeEach(() => {
            return inst.and('test = ?', 3);
        });

        it('>> toString()', () => {
            areEqual(inst.toString(), 'test = 3');
        });

        it('>> toParam()', () => {
            areEqual(inst.toParam(), {
                text: 'test = ?',
                values: [3],
            });
        });

        describe('>> and("flight = ?", "4")', () => {
            beforeEach(() => {
                return inst.and('flight = ?', '4');
            });

            it('>> toString()', () => {
                areEqual(inst.toString(), "test = 3 AND flight = '4'");
            });

            it('>> toParam()', () => {
                areEqual(inst.toParam(), {
                    text: 'test = ? AND flight = ?',
                    values: [3, '4'],
                });
            });

            describe('>> or("dummy IN ?", [false, 2, null, "str"])', () => {
                beforeEach(() => {
                    return inst.or('dummy IN ?', [false, 2, null, 'str']);
                });

                it('>> toString()', () => {
                    areEqual(inst.toString(), "test = 3 AND flight = '4' OR dummy IN (FALSE, 2, NULL, 'str')");
                });

                it('>> toParam()', () => {
                    areEqual(inst.toParam(), {
                        text: 'test = ? AND flight = ? OR dummy IN (?, ?, ?, ?)',
                        values: [3, '4', false, 2, null, 'str'],
                    });
                });
            });
        });
    });

    describe('or("test = 3")', () => {
        beforeEach(() => {
            return inst.or('test = 3');
        });

        it('>> toString()', () => {
            areEqual(inst.toString(), 'test = 3');
        });

        it('>> toParam()', () => {
            areEqual(inst.toParam(), {
                text: 'test = 3',
                values: [],
            });
        });

        describe('>> or("flight = \'4\'")', () => {
            beforeEach(() => {
                return inst.or("flight = '4'");
            });

            it('>> toString()', () => {
                areEqual(inst.toString(), "test = 3 OR flight = '4'");
            });

            it('>> toString()', () => {
                areEqual(inst.toParam(), {
                    text: "test = 3 OR flight = '4'",
                    values: [],
                });
            });

            describe('>> and("dummy IN (1,2,3)")', () => {
                beforeEach(() => {
                    return inst.and('dummy IN (1,2,3)');
                });

                it('>> toString()', () => {
                    areEqual(inst.toString(), "test = 3 OR flight = '4' AND dummy IN (1,2,3)");
                });

                it('>> toParam()', () => {
                    areEqual(inst.toParam(), {
                        text: "test = 3 OR flight = '4' AND dummy IN (1,2,3)",
                        values: [],
                    });
                });
            });
        });
    });

    describe('or("test = ?", 3)', () => {
        beforeEach(() => {
            return inst.or('test = ?', 3);
        });

        it('>> toString()', () => {
            areEqual(inst.toString(), 'test = 3');
        });

        it('>> toParam()', () => {
            areEqual(inst.toParam(), {
                text: 'test = ?',
                values: [3],
            });
        });

        describe('>> or("flight = ?", "4")', () => {
            beforeEach(() => {
                return inst.or('flight = ?', '4');
            });

            it('>> toString()', () => {
                areEqual(inst.toString(), "test = 3 OR flight = '4'");
            });

            it('>> toParam()', () => {
                areEqual(inst.toParam(), {
                    text: 'test = ? OR flight = ?',
                    values: [3, '4'],
                });
            });

            describe('>> and("dummy IN ?", [false, 2, null, "str"])', () => {
                beforeEach(() => {
                    return inst.and('dummy IN ?', [false, 2, null, 'str']);
                });

                it('>> toString()', () => {
                    areEqual(inst.toString(), "test = 3 OR flight = '4' AND dummy IN (FALSE, 2, NULL, 'str')");
                });

                it('>> toParam()', () => {
                    areEqual(inst.toParam(), {
                        text: 'test = ? OR flight = ? AND dummy IN (?, ?, ?, ?)',
                        values: [3, '4', false, 2, null, 'str'],
                    });
                });
            });
        });
    });

    describe('or("test = ?", 4)', () => {
        beforeEach(() => {
            return inst.or('test = ?', 4);
        });

        describe('>> and(expr().or("inner = ?", 1))', () => {
            beforeEach(() => {
                return inst.and(squel.expr().or('inner = ?', 1));
            });

            it('>> toString()', () => {
                areEqual(inst.toString(), 'test = 4 AND (inner = 1)');
            });

            it('>> toParam()', () => {
                areEqual(inst.toParam(), {
                    text: 'test = ? AND (inner = ?)',
                    values: [4, 1],
                });
            });
        });

        describe('>> and(expr().or("inner = ?", 1).or(expr().and("another = ?", 34)))', () => {
            beforeEach(() => {
                return inst.and(squel.expr().or('inner = ?', 1).or(squel.expr().and('another = ?', 34)));
            });

            it('>> toString()', () => {
                areEqual(inst.toString(), 'test = 4 AND (inner = 1 OR (another = 34))');
            });

            it('>> toParam()', () => {
                areEqual(inst.toParam(), {
                    text: 'test = ? AND (inner = ? OR (another = ?))',
                    values: [4, 1, 34],
                });
            });
        });
    });

    describe('custom parameter character: @@', () => {
        beforeEach(() => {
            return (inst.options.parameterCharacter = '@@');
        });

        describe('and("test = @@", 3).and("flight = @@", "4").or("dummy IN @@", [false, 2, null, "str"])', () => {
            beforeEach(() => {
                return inst.and('test = @@', 3).and('flight = @@', '4').or('dummy IN @@', [false, 2, null, 'str']);
            });

            it('>> toString()', () => {
                areEqual(inst.toString(), "test = 3 AND flight = '4' OR dummy IN (FALSE, 2, NULL, 'str')");
            });

            it('>> toParam()', () => {
                areEqual(inst.toParam(), {
                    text: 'test = @@ AND flight = @@ OR dummy IN (@@, @@, @@, @@)',
                    values: [3, '4', false, 2, null, 'str'],
                });
            });
        });
    });

    it('cloning', () => {
        const newinst = inst.or('test = 4').or('inner = 1').or('inner = 2').clone();

        newinst.or('inner = 3');

        areEqual(inst.toString(), 'test = 4 OR inner = 1 OR inner = 2');
        areEqual(newinst.toString(), 'test = 4 OR inner = 1 OR inner = 2 OR inner = 3');
    });

    it('custom array prototype methods (Issue #210)', () => {
        Array.prototype.last = function () {
            return this[this.length - 1];
        };

        inst.or('foo = ?', 'bar');

        delete Array.prototype.last;
    });

    describe('any type of builder', () => {
        beforeEach(() => {
            return inst.or('b = ?', 5).or(squel.select().from('blah').where('a = ?', 9));
        });
        it('toString()', () => {
            areEqual(inst.toString(), 'b = 5 OR (SELECT * FROM blah WHERE (a = 9))');
        });
        it('toParam()', () => {
            areEqual(inst.toParam(), {
                text: 'b = ? OR (SELECT * FROM blah WHERE (a = ?))',
                values: [5, 9],
            });
        });
    });

    describe('#286 - nesting', () => {
        beforeEach(() => {
            return (inst = squel
                .expr()
                .and(squel.expr().and(squel.expr().and('A').and('B')).or(squel.expr().and('C').and('D')))
                .and('E'));
        });
        it('toString()', () => {
            areEqual(inst.toString(), '((A AND B) OR (C AND D)) AND E');
        });
        it('toParam()', () => {
            areEqual(inst.toParam(), {
                text: '((A AND B) OR (C AND D)) AND E',
                values: [],
            });
        });
    });
});
