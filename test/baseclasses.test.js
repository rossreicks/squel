/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-new-object */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-classes-per-file */

/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
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
import _ from 'underscore';
import { assert } from 'chai';
import { squel } from '../src';
import {
    StringBlock,
    FunctionBlock,
    LimitBlock,
    DistinctBlock,
    WhereBlock,
    Block,
} from '../src/block';
import { BaseBuilder, DefaultQueryBuilderOptions } from '../src/base-builder';
import { QueryBuilder } from '../src/query-builder';
import { Cloneable } from '../src/cloneable';

let mocker;
let inst = new BaseBuilder();

assert.same = function (actual, expected, message) {
    assert.deepEqual(actual, expected, message);
};

describe('Base Classes', () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
        inst = new BaseBuilder();
    });

    afterEach(() => {
        mocker.restore();
    });

    it('Version number', () => {
        // eslint-disable-next-line global-require
        assert.same(squel.VERSION, require('../package.json').version);
    });

    it('Default flavour', () => {
        assert.isNull(squel.flavour);
    });

    describe('Cloneable Base Class', () => {
        it('Clone', () => {
            class Child extends Cloneable {
                constructor() {
                    super();
                    this.a = 1;
                    this.b = 2.2;
                    this.c = true;
                    this.d = 'str';
                    this.e = [1];
                    this.f = { a: 1 };
                }
            }

            const child = new Child();

            const copy = child.clone();

            assert.instanceOf(copy, Child);

            child.a = 2;
            child.b = 3.2;
            child.c = false;
            child.d = 'str2';
            child.e.push(2);
            child.f.b = 1;

            assert.same(copy.a, 1);
            assert.same(copy.b, 2.2);
            assert.same(copy.c, true);
            assert.same(copy.d, 'str');
            assert.same(copy.e, [1]);
            assert.same(copy.f, { a: 1 });
        });
    });

    describe('Default query builder options', () => {
        assert.same(
            {
                autoQuoteTableNames: false,
                autoQuoteFieldNames: false,
                autoQuoteAliasNames: true,
                useAsForTableAliasNames: false,
                nameQuoteCharacter: '`',
                tableAliasQuoteCharacter: '`',
                fieldAliasQuoteCharacter: '"',
                valueHandlers: [],
                parameterCharacter: '?',
                numberedParameters: false,
                numberedParametersPrefix: '$',
                numberedParametersStartAt: 1,
                replaceSingleQuotes: false,
                singleQuoteReplacement: "''",
                separator: ' ',
                stringFormatter: null,
                rawNesting: false,
            },
            DefaultQueryBuilderOptions
        );
    });

    describe('Register global custom value handler', () => {
        let originalHandlers;

        beforeEach(() => {
            originalHandlers = [].concat(squel.globalValueHandlers);
            squel.globalValueHandlers = [];
        });

        afterEach(() => {
            squel.globalValueHandlers = originalHandlers;
        });

        it('default', () => {
            const handler = () => 'test';

            squel.registerValueHandler(Date, handler);
            squel.registerValueHandler(Object, handler);
            squel.registerValueHandler('boolean', handler);

            assert.same(3, squel.globalValueHandlers.length);
            assert.same({ type: Date, handler }, squel.globalValueHandlers[0]);
            assert.same({ type: Object, handler }, squel.globalValueHandlers[1]);
            assert.same({ type: 'boolean', handler }, squel.globalValueHandlers[2]);
        });

        it('type should be class constructor', () => {
            assert.throws(
                () => squel.registerValueHandler(1, null),
                'type must be a class constructor or string'
            );
        });

        it('handler should be function', () => {
            class MyClass {}

            assert.throws(
                () => squel.registerValueHandler(MyClass, 1),
                'handler must be a function'
            );
        });

        it('overrides existing handler', () => {
            const handler = () => 'test';
            const handler2 = () => 'test2';

            squel.registerValueHandler(Date, handler);
            squel.registerValueHandler(Date, handler2);

            assert.same(1, squel.globalValueHandlers.length);
            assert.same(
                { type: Date, handler: handler2 },
                squel.globalValueHandlers[0]
            );
        });
    });

    describe('str()', () => {
        it('constructor()', () => {
            const f = squel.str('GETDATE(?)', 12, 23);

            assert.ok(f instanceof FunctionBlock);
            assert.same('GETDATE(?)', f._strings[0]);
            assert.same([12, 23], f._values[0]);
        });

        describe('custom value handler', () => {
            let handler;

            beforeEach(() => {
                inst = squel.str('G(?,?)', 12, 23, 65);

                const handlerConfig = _.find(
                    squel.globalValueHandlers,
                    (hc) => hc.type === FunctionBlock
                );

                handler = handlerConfig.handler;
            });

            it('toString', () => {
                assert.same(inst.toString(), handler(inst));
            });
            it('toParam', () => {
                assert.same(inst.toParam(), handler(inst, true));
            });
        });
    });

    describe('rstr()', () => {
        it('constructor()', () => {
            const f = squel.rstr('GETDATE(?)', 12, 23);

            assert.ok(f instanceof FunctionBlock);
            assert.same('GETDATE(?)', f._strings[0]);
            assert.same([12, 23], f._values[0]);
        });

        it('vsStr()', () => {
            const f1 = squel.str('OUTER(?)', squel.str('INNER(?)', 2));

            assert.same('OUTER((INNER(2)))', f1.toString());
            const f2 = squel.str('OUTER(?)', squel.rstr('INNER(?)', 2));

            assert.same('OUTER(INNER(2))', f2.toString());
        });

        describe('custom value handler', () => {
            let handler;

            beforeEach(() => {
                inst = squel.rstr('G(?,?)', 12, 23, 65);

                const handlerConfig = _.find(
                    squel.globalValueHandlers,
                    (hc) => hc.type === FunctionBlock
                );

                handler = handlerConfig.handler;
            });

            it('toString', () => {
                assert.same(inst.toString(), handler(inst));
            });
            it('toParam', () => {
                assert.same(inst.toParam(), handler(inst, true));
            });
        });
    });

    describe('Load an SQL flavour', () => {
        beforeEach(() => {
            this.flavoursBackup = squel.flavours;
            squel.flavours = {};
        });

        afterEach(() => {
            squel.flavours = this.flavoursBackup;
        });

        it('invalid flavour', () => {
            assert.throws(
                () => squel.useFlavour('test'),
                'Flavour not available: test'
            );
        });

        it('flavour reference should be a function', () => {
            squel.flavours.test = 'blah';
            assert.throws(
                () => squel.useFlavour('test'),
                'Flavour not available: test'
            );
        });

        it('flavour setup function gets executed', () => {
            squel.flavours.test = mocker.spy();
            const ret = squel.useFlavour('test');

            assert.ok(squel.flavours.test.calledOnce);
            assert.ok(!!ret.select());
        });

        it('can switch flavours', () => {
            squel.flavours.test = mocker.spy((s) => (s.dummy = 1));
            squel.flavours.test2 = mocker.spy((s) => (s.dummy2 = 2));
            let ret = squel.useFlavour('test');

            assert.same(ret.dummy, 1);

            ret = squel.useFlavour('test2');
            assert.same(ret.dummy, undefined);
            assert.same(ret.dummy2, 2);

            ret = squel.useFlavour();
            assert.same(ret.dummy, undefined);
            assert.same(ret.dummy2, undefined);
        });

        it('can get current flavour', () => {
            const flavour = 'test';

            squel.flavours[flavour] = mocker.spy();

            const ret = squel.useFlavour(flavour);

            assert.same(ret.flavour, flavour);
        });

        it('can mix flavours - #255', () => {
            squel.flavours.flavour1 = (s) => s;
            squel.flavours.flavour2 = (s) => s;
            const squel1 = squel.useFlavour('flavour1');
            const squel2 = squel.useFlavour('flavour2');

            const expr1 = squel1.expr().and('1 = 1');

            assert.same(
                squel2.select().from('test', 't').where(expr1).toString(),
                'SELECT * FROM test `t` WHERE (1 = 1)'
            );
        });
    });

    describe('Builder base class', () => {
        let originalHandlers = squel.globalValueHandlers;

        beforeEach(() => {
            inst = new BaseBuilder();

            originalHandlers = [].concat(squel.globalValueHandlers);
        });

        afterEach(() => {
            squel.globalValueHandlers = originalHandlers;
        });

        it('instanceof Cloneable', () => {
            assert.instanceOf(inst, Cloneable);
        });

        describe('constructor', () => {
            it('default options', () => {
                assert.same(DefaultQueryBuilderOptions, inst.options);
            });

            it('overridden options', () => {
                inst = new BaseBuilder({
                    dummy1: 'str',
                    dummy2: 12.3,
                    usingValuePlaceholders: true,
                    dummy3: true,
                    globalValueHandlers: [1],
                });

                const expectedOptions = _.extend(
                    {},
                    DefaultQueryBuilderOptions,
                    {
                        dummy1: 'str',
                        dummy2: 12.3,
                        usingValuePlaceholders: true,
                        dummy3: true,
                        globalValueHandlers: [1],
                    }
                );

                assert.same(expectedOptions, inst.options);
            });
        });

        describe('registerValueHandler', () => {
            it('afterEach', () => {
                squel.globalValueHandlers = [];
            });

            it('default', () => {
                const handler = () => 'test';

                inst.registerValueHandler(Date, handler);
                inst.registerValueHandler(Object, handler);
                inst.registerValueHandler('number', handler);

                assert.same(3, inst.options.valueHandlers.length);
                assert.same(
                    { type: Date, handler },
                    inst.options.valueHandlers[0]
                );
                assert.same(
                    { type: Object, handler },
                    inst.options.valueHandlers[1]
                );
                assert.same(
                    { type: 'number', handler },
                    inst.options.valueHandlers[2]
                );
            });

            it('type should be class constructor', () => {
                assert.throws(
                    () => inst.registerValueHandler(1, null),
                    'type must be a class constructor or string'
                );
            });

            it('handler should be function', () => {
                class MyClass {}
                assert.throws(
                    () => inst.registerValueHandler(MyClass, 1),
                    'handler must be a function'
                );
            });

            it('returns instance for chainability', () => {
                const handler = () => 'test';

                assert.same(inst, inst.registerValueHandler(Date, handler));
            });

            it('overrides existing handler', () => {
                const handler = () => 'test';
                const handler2 = () => 'test2';

                inst.registerValueHandler(Date, handler);
                inst.registerValueHandler(Date, handler2);

                assert.same(1, inst.options.valueHandlers.length);
                assert.same(
                    { type: Date, handler: handler2 },
                    inst.options.valueHandlers[0]
                );
            });

            it('does not touch global value handlers list', () => {
                const oldGlobalHandlers = squel.globalValueHandlers;

                const handler = () => 'test';

                inst.registerValueHandler(Date, handler);

                assert.same(oldGlobalHandlers, squel.globalValueHandlers);
            });
        });

        describe('_sanitizeExpression', () => {
            describe('if Expression', () => {
                it('empty expression', () => {
                    const e = squel.expr();

                    assert.same(e, inst._sanitizeExpression(e));
                });
                it('non-empty expression', () => {
                    const e = squel.expr().and("s.name <> 'Fred'");

                    assert.same(e, inst._sanitizeExpression(e));
                });
            });

            it('if Expression', () => {
                const s = squel.str('s');

                assert.same(s, inst._sanitizeExpression(s));
            });

            it('if string', () => {
                const s = 'BLA BLA';

                assert.same('BLA BLA', inst._sanitizeExpression(s));
            });

            it('if neither expression, builder nor String', () => {
                const testFn = () => inst._sanitizeExpression(1);

                assert.throws(
                    testFn,
                    'expression must be a string or builder instance'
                );
            });
        });

        describe('_sanitizeName', () => {
            beforeEach(() => {
                mocker.spy(inst, '_sanitizeName');
            });

            it('if string', () => {
                assert.same('bla', inst._sanitizeName('bla'));
            });

            it('if boolean', () => {
                assert.throws(
                    () => inst._sanitizeName(true, 'bla'),
                    'bla must be a string'
                );
            });

            it('if integer', () => {
                assert.throws(
                    () => inst._sanitizeName(1),
                    'undefined must be a string'
                );
            });

            it('if float', () => {
                assert.throws(
                    () => inst._sanitizeName(1.2, 'meh'),
                    'meh must be a string'
                );
            });

            it('if array', () => {
                assert.throws(
                    () => inst._sanitizeName([1], 'yes'),
                    'yes must be a string'
                );
            });

            it('if object', () => {
                assert.throws(
                    () => inst._sanitizeName(new Object(), 'yes'),
                    'yes must be a string'
                );
            });

            it('if null', () => {
                assert.throws(
                    () => inst._sanitizeName(null, 'no'),
                    'no must be a string'
                );
            });

            it('if undefined', () => {
                assert.throws(
                    () => inst._sanitizeName(undefined, 'no'),
                    'no must be a string'
                );
            });
        });

        describe('_sanitizeField', () => {
            it('default', () => {
                mocker.spy(inst, '_sanitizeName');

                assert.same('abc', inst._sanitizeField('abc'));

                assert.ok(
                    inst._sanitizeName.calledWithExactly('abc', 'field name')
                );
            });

            it('QueryBuilder', () => {
                const s = squel.select().from('scores').field('MAX(score)');

                assert.same(s, inst._sanitizeField(s));
            });
        });

        describe('_sanitizeBaseBuilder', () => {
            it('is not base builder', () => {
                assert.throws(
                    () => inst._sanitizeBaseBuilder(null),
                    'must be a builder instance'
                );
            });

            it('is a query builder', () => {
                const qry = squel.select();

                assert.same(qry, inst._sanitizeBaseBuilder(qry));
            });
        });

        describe('_sanitizeTable', () => {
            it('default', () => {
                mocker.spy(inst, '_sanitizeName');

                assert.same('abc', inst._sanitizeTable('abc'));

                assert.ok(inst._sanitizeName.calledWithExactly('abc', 'table'));
            });

            it('not a string', () => {
                assert.throws(
                    () => inst._sanitizeTable(null),
                    'table name must be a string or a builder'
                );
            });

            it('query builder', () => {
                const select = squel.select();

                assert.same(select, inst._sanitizeTable(select, true));
            });
        });

        describe('_sanitizeFieldAlias', () => {
            it('default', () => {
                mocker.spy(inst, '_sanitizeName');

                inst._sanitizeFieldAlias('abc');

                assert.ok(
                    inst._sanitizeName.calledWithExactly('abc', 'field alias')
                );
            });
        });

        describe('_sanitizeTableAlias', () => {
            it('default', () => {
                mocker.spy(inst, '_sanitizeName');

                inst._sanitizeTableAlias('abc');

                assert.ok(
                    inst._sanitizeName.calledWithExactly('abc', 'table alias')
                );
            });
        });

        describe('_sanitizeLimitOffset', () => {
            it('undefined', () => {
                assert.throws(
                    () => inst._sanitizeLimitOffset(),
                    'limit/offset must be >= 0'
                );
            });

            it('null', () => {
                assert.throws(
                    () => inst._sanitizeLimitOffset(null),
                    'limit/offset must be >= 0'
                );
            });

            it('float', () => {
                assert.same(1, inst._sanitizeLimitOffset(1.2));
            });

            it('boolean', () => {
                assert.throws(
                    () => inst._sanitizeLimitOffset(false),
                    'limit/offset must be >= 0'
                );
            });

            it('string', () => {
                assert.same(2, inst._sanitizeLimitOffset('2'));
            });

            it('array', () => {
                assert.same(3, inst._sanitizeLimitOffset([3]));
            });

            it('object', () => {
                assert.throws(
                    () => inst._sanitizeLimitOffset(new Object()),
                    'limit/offset must be >= 0'
                );
            });

            it('number >= 0', () => {
                assert.same(0, inst._sanitizeLimitOffset(0));
                assert.same(1, inst._sanitizeLimitOffset(1));
            });

            it('number < 0', () => {
                assert.throws(
                    () => inst._sanitizeLimitOffset(-1),
                    'limit/offset must be >= 0'
                );
            });
        });

        describe('_sanitizeValue', () => {
            beforeEach(() => {
                mocker.spy(inst, '_sanitizeValue');
            });

            afterEach(() => {
                squel.globalValueHandlers = [];
            });

            it('if string', () => {
                assert.same('bla', inst._sanitizeValue('bla'));
            });

            it('if boolean', () => {
                assert.same(true, inst._sanitizeValue(true));
                assert.same(false, inst._sanitizeValue(false));
            });

            it('if integer', () => {
                assert.same(-1, inst._sanitizeValue(-1));
                assert.same(0, inst._sanitizeValue(0));
                assert.same(1, inst._sanitizeValue(1));
            });

            it('if float', () => {
                assert.same(-1.2, inst._sanitizeValue(-1.2));
                assert.same(1.2, inst._sanitizeValue(1.2));
            });

            it('if array', () => {
                assert.throws(
                    () => inst._sanitizeValue([1]),
                    'field value must be a string, number, boolean, null or one of the registered custom value types'
                );
            });

            it('if object', () => {
                assert.throws(
                    () => inst._sanitizeValue(new Object()),
                    'field value must be a string, number, boolean, null or one of the registered custom value types'
                );
            });
            it('if null', () => {
                assert.same(null, inst._sanitizeValue(null));
            });

            it('if BaseBuilder', () => {
                const s = squel.select();

                assert.same(s, inst._sanitizeValue(s));
            });

            it('if undefined', () => {
                assert.throws(
                    () => inst._sanitizeValue(undefined),
                    'field value must be a string, number, boolean, null or one of the registered custom value types'
                );
            });

            describe('custom handlers', () => {
                it('global', () => {
                    squel.registerValueHandler(Date, _.identity);
                    const date = new Date();

                    assert.same(date, inst._sanitizeValue(date));
                });

                it('instance', () => {
                    inst.registerValueHandler(Date, _.identity);
                    const date = new Date();

                    assert.same(date, inst._sanitizeValue(date));
                });
            });
        });

        it('_escapeValue', () => {
            inst.options.replaceSingleQuotes = false;
            assert.same("te'st", inst._escapeValue("te'st"));

            inst.options.replaceSingleQuotes = true;
            assert.same("te''st", inst._escapeValue("te'st"));

            inst.options.singleQuoteReplacement = '--';
            assert.same('te--st', inst._escapeValue("te'st"));

            inst.options.singleQuoteReplacement = '--';
            assert.same(undefined, inst._escapeValue());
        });

        describe('_formatTableName', () => {
            it('default', () => {
                assert.same('abc', inst._formatTableName('abc'));
            });

            describe('auto quote names', () => {
                beforeEach(() => {
                    inst.options.autoQuoteTableNames = true;
                });

                it('default quote character', () => {
                    assert.same('`abc`', inst._formatTableName('abc'));
                });

                it('custom quote character', () => {
                    inst.options.nameQuoteCharacter = '|';
                    assert.same('|abc|', inst._formatTableName('abc'));
                });
            });
        });

        describe('_formatTableAlias', () => {
            it('default', () => {
                assert.same('`abc`', inst._formatTableAlias('abc'));
            });

            it('custom quote character', () => {
                inst.options.tableAliasQuoteCharacter = '~';
                assert.same('~abc~', inst._formatTableAlias('abc'));
            });

            it('auto quote alias names is OFF', () => {
                inst.options.autoQuoteAliasNames = false;
                assert.same('abc', inst._formatTableAlias('abc'));
            });

            it('AS is turned ON', () => {
                inst.options.autoQuoteAliasNames = false;
                inst.options.useAsForTableAliasNames = true;
                assert.same('AS abc', inst._formatTableAlias('abc'));
            });
        });

        describe('_formatFieldAlias', () => {
            it('default()', () => {
                assert.same('"abc"', inst._formatFieldAlias('abc'));
            });

            it('custom quote character', () => {
                inst.options.fieldAliasQuoteCharacter = '~';
                assert.same('~abc~', inst._formatFieldAlias('abc'));
            });

            it('auto quote alias names is OFF', () => {
                inst.options.autoQuoteAliasNames = false;
                assert.same('abc', inst._formatFieldAlias('abc'));
            });
        });

        describe('_formatFieldName', () => {
            it('default()', () => {
                assert.same('abc', inst._formatFieldName('abc'));
            });

            describe('auto quote names', () => {
                beforeEach(() => {
                    inst.options.autoQuoteFieldNames = true;
                });

                it('default quote character', () => {
                    assert.same(
                        '`abc`.`def`',
                        inst._formatFieldName('abc.def')
                    );
                });

                it('do not quote *', () => {
                    assert.same('`abc`.*', inst._formatFieldName('abc.*'));
                });

                it('custom quote character', () => {
                    inst.options.nameQuoteCharacter = '|';
                    assert.same(
                        '|abc|.|def|',
                        inst._formatFieldName('abc.def')
                    );
                });

                it('ignore periods when quoting', () => {
                    assert.same(
                        '`abc.def`',
                        inst._formatFieldName('abc.def', {
                            ignorePeriodsForFieldNameQuotes: true,
                        })
                    );
                });
            });
        });

        describe('_formatCustomValue', () => {
            it('not a custom value type', () => {
                assert.same(
                    { formatted: false, value: null },
                    inst._formatCustomValue(null)
                );
                assert.same(
                    { formatted: false, value: 'abc' },
                    inst._formatCustomValue('abc')
                );
                assert.same(
                    { formatted: false, value: 12 },
                    inst._formatCustomValue(12)
                );
                assert.same(
                    { formatted: false, value: 1.2 },
                    inst._formatCustomValue(1.2)
                );
                assert.same(
                    { formatted: false, value: true },
                    inst._formatCustomValue(true)
                );
                assert.same(
                    { formatted: false, value: false },
                    inst._formatCustomValue(false)
                );
            });

            describe('custom value type', () => {
                it('global', () => {
                    class MyClass {}
                    const myObj = new MyClass();

                    squel.registerValueHandler(MyClass, () => 3.14);
                    squel.registerValueHandler('boolean', (v) => `a${v}`);

                    assert.same(
                        { formatted: true, value: 3.14 },
                        inst._formatCustomValue(myObj)
                    );
                    assert.same(
                        { formatted: true, value: 'atrue' },
                        inst._formatCustomValue(true)
                    );
                });

                it('instance', () => {
                    class MyClass {}
                    const myObj = new MyClass();

                    inst.registerValueHandler(MyClass, () => 3.14);
                    inst.registerValueHandler('number', (v) => `${v}a`);

                    assert.same(
                        { formatted: true, value: 3.14 },
                        inst._formatCustomValue(myObj)
                    );
                    assert.same(
                        { formatted: true, value: '5.2a' },
                        inst._formatCustomValue(5.2)
                    );
                });

                it('instance handler takes precedence over global', () => {
                    inst.registerValueHandler(Date, (d) => 'hello');
                    squel.registerValueHandler(Date, (d) => 'goodbye');

                    assert.same(
                        { formatted: true, value: 'hello' },
                        inst._formatCustomValue(new Date())
                    );

                    inst = new BaseBuilder({
                        valueHandlers: [],
                    });
                    assert.same(
                        { formatted: true, value: 'goodbye' },
                        inst._formatCustomValue(new Date())
                    );
                });

                it('whether to format for parameterized output', () => {
                    inst.registerValueHandler(Date, (d, asParam) => {
                        if (asParam) {
                            return 'foo';
                        }

                        return 'bar';
                    });

                    const val = new Date();

                    assert.same(
                        { formatted: true, value: 'foo' },
                        inst._formatCustomValue(val, true)
                    );
                    assert.same(
                        { formatted: true, value: 'bar' },
                        inst._formatCustomValue(val)
                    );
                });

                it('additional formatting options', () => {
                    inst.registerValueHandler(Date, (d, asParam, options) => {
                        if (options.dontQuote) {
                            return 'foo';
                        }
                    });

                    const val = new Date();

                    assert.same(
                        { formatted: true, value: 'foo' },
                        inst._formatCustomValue(val, true, {
                            dontQuote: true,
                        })
                    );
                    assert.same(
                        { formatted: true, value: '"foo"' },
                        inst._formatCustomValue(val, true, {
                            dontQuote: false,
                        })
                    );
                });
                it('return raw', () => {
                    inst.registerValueHandler(Date, (d) => ({
                        rawNesting: true,
                        value: 'foo',
                    }));

                    const val = new Date();

                    assert.same(
                        { rawNesting: true, formatted: true, value: 'foo' },
                        inst._formatCustomValue(val, true)
                    );
                });
            });
        });

        describe('_formatValueForParamArray', () => {
            it('Query builder', () => {
                const s = squel.select().from('table');

                assert.same(s, inst._formatValueForParamArray(s));
            });

            it('else calls _formatCustomValue', () => {
                const spy = mocker.stub(
                    inst,
                    '_formatCustomValue',
                    (v, asParam) => ({
                        formatted: true,
                        value: `test${asParam ? 'foo' : 'bar'}`,
                    })
                );

                assert.same('testfoo', inst._formatValueForParamArray(null));
                assert.same('testfoo', inst._formatValueForParamArray('abc'));
                assert.same('testfoo', inst._formatValueForParamArray(12));
                assert.same('testfoo', inst._formatValueForParamArray(1.2));

                const opts = { dummy: true };

                assert.same(
                    'testfoo',
                    inst._formatValueForParamArray(true, opts)
                );

                assert.same('testfoo', inst._formatValueForParamArray(false));

                assert.same(6, spy.callCount);

                assert.same(spy.getCall(4).args[2], opts);
            });

            it('Array - recursively calls itself on each element', () => {
                const spy = mocker.spy(inst, '_formatValueForParamArray');

                const v = [squel.select().from('table'), 1.2];

                const opts = { dummy: true };
                const res = inst._formatValueForParamArray(v, opts);

                assert.same(v, res);

                assert.same(3, spy.callCount);
                assert.ok(spy.calledWith(v[0]));
                assert.ok(spy.calledWith(v[1]));

                assert.same(spy.getCall(1).args[1], opts);
            });
        });

        describe('_formatValueForQueryString', () => {
            it('null', () => {
                assert.same('NULL', inst._formatValueForQueryString(null));
            });

            it('boolean', () => {
                assert.same('TRUE', inst._formatValueForQueryString(true));
                assert.same('FALSE', inst._formatValueForQueryString(false));
            });

            it('integer', () => {
                assert.same(12, inst._formatValueForQueryString(12));
            });

            it('float', () => {
                assert.same(1.2, inst._formatValueForQueryString(1.2));
            });

            describe('string', () => {
                it('have string formatter function', () => {
                    inst.options.stringFormatter = (str) => `N(${str})`;

                    assert.same(
                        'N(test)',
                        inst._formatValueForQueryString('test')
                    );
                });

                it('default', () => {
                    let escapedValue;

                    mocker.stub(
                        inst,
                        '_escapeValue',
                        (str) => escapedValue || str
                    );

                    assert.same(
                        "'test'",
                        inst._formatValueForQueryString('test')
                    );

                    assert.ok(inst._escapeValue.calledWithExactly('test'));
                    escapedValue = 'blah';
                    assert.same(
                        "'blah'",
                        inst._formatValueForQueryString('test')
                    );
                });

                it('dont quote', () => {
                    const escapedValue = undefined;

                    mocker.stub(
                        inst,
                        '_escapeValue',
                        (str) => escapedValue || str
                    );

                    assert.same(
                        'test',
                        inst._formatValueForQueryString('test', {
                            dontQuote: true,
                        })
                    );

                    assert.ok(inst._escapeValue.notCalled);
                });
            });

            it('Array - recursively calls itself on each element', () => {
                const spy = mocker.spy(inst, '_formatValueForQueryString');

                const expected = "('test', 123, TRUE, 1.2, NULL)";

                assert.same(
                    expected,
                    inst._formatValueForQueryString([
                        'test',
                        123,
                        true,
                        1.2,
                        null,
                    ])
                );

                assert.same(6, spy.callCount);
                assert.ok(spy.calledWith('test'));
                assert.ok(spy.calledWith(123));
                assert.ok(spy.calledWith(true));
                assert.ok(spy.calledWith(1.2));
                assert.ok(spy.calledWith(null));
            });

            it('BaseBuilder', () => {
                const spy = mocker.stub(
                    inst,
                    '_applyNestingFormatting',
                    (v) => `{{${v}}}`
                );
                const s = squel.select().from('table');

                assert.same(
                    '{{SELECT * FROM table}}',
                    inst._formatValueForQueryString(s)
                );
            });

            it('checks to see if it is custom value type first', () => {
                mocker.stub(inst, '_formatCustomValue', (val, asParam) => ({
                    formatted: true,
                    value: 12 + (asParam ? 25 : 65),
                }));
                mocker.stub(inst, '_applyNestingFormatting', (v) => `{${v}}`);
                assert.same('{77}', inst._formatValueForQueryString(123));
            });

            it('#292 - custom value type specifies raw nesting', () => {
                mocker.stub(inst, '_formatCustomValue', (val, asParam) => ({
                    rawNesting: true,
                    formatted: true,
                    value: 12,
                }));
                mocker.stub(inst, '_applyNestingFormatting', (v) => `{${v}}`);
                assert.same(12, inst._formatValueForQueryString(123));
            });
        });

        describe('_applyNestingFormatting', () => {
            it('default()', () => {
                assert.same('(77)', inst._applyNestingFormatting('77'));
                assert.same('((77)', inst._applyNestingFormatting('(77'));
                assert.same('(77))', inst._applyNestingFormatting('77)'));
                assert.same('(77)', inst._applyNestingFormatting('(77)'));
            });
            it('no nesting', () => {
                assert.same('77', inst._applyNestingFormatting('77', false));
            });
            it('rawNesting turned on', () => {
                inst = new BaseBuilder({ rawNesting: true });
                assert.same('77', inst._applyNestingFormatting('77'));
            });
        });

        describe('_buildString', () => {
            it('empty', () => {
                assert.same(inst._buildString('', []), {
                    text: '',
                    values: [],
                });
            });
            describe('no params', () => {
                it('non-parameterized', () => {
                    assert.same(inst._buildString('abc = 3', []), {
                        text: 'abc = 3',
                        values: [],
                    });
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildString('abc = 3', [], {
                            buildParameterized: true,
                        }),
                        {
                            text: 'abc = 3',
                            values: [],
                        }
                    );
                });
            });
            describe('non-array', () => {
                it('non-parameterized', () => {
                    assert.same(
                        inst._buildString('a = ? ? ? ?', [
                            2,
                            'abc',
                            false,
                            null,
                        ]),
                        {
                            text: "a = 2 'abc' FALSE NULL",
                            values: [],
                        }
                    );
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildString(
                            'a = ? ? ? ?',
                            [2, 'abc', false, null],
                            { buildParameterized: true }
                        ),
                        {
                            text: 'a = ? ? ? ?',
                            values: [2, 'abc', false, null],
                        }
                    );
                });
            });
            describe('array', () => {
                it('non-parameterized', () => {
                    assert.same(inst._buildString('a = ?', [[1, 2, 3]]), {
                        text: 'a = (1, 2, 3)',
                        values: [],
                    });
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildString('a = ?', [[1, 2, 3]], {
                            buildParameterized: true,
                        }),
                        {
                            text: 'a = (?, ?, ?)',
                            values: [1, 2, 3],
                        }
                    );
                });
            });
            describe('nested builder', () => {
                beforeEach(
                    () =>
                        (this.s = squel
                            .select()
                            .from('master')
                            .where('b = ?', 5))
                );

                it('non-parameterized', () => {
                    assert.same(inst._buildString('a = ?', [this.s]), {
                        text: 'a = (SELECT * FROM master WHERE (b = 5))',
                        values: [],
                    });
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildString('a = ?', [this.s], {
                            buildParameterized: true,
                        }),
                        {
                            text: 'a = (SELECT * FROM master WHERE (b = ?))',
                            values: [5],
                        }
                    );
                });
            });
            describe('return nested output', () => {
                it('non-parameterized', () => {
                    assert.same(
                        inst._buildString('a = ?', [3], { nested: true }),
                        {
                            text: '(a = 3)',
                            values: [],
                        }
                    );
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildString('a = ?', [3], {
                            buildParameterized: true,
                            nested: true,
                        }),
                        {
                            text: '(a = ?)',
                            values: [3],
                        }
                    );
                });
            });
            it('string formatting options', () => {
                const options = {
                    formattingOptions: {
                        dontQuote: true,
                    },
                };

                assert.same(inst._buildString('a = ?', ['NOW()'], options), {
                    text: 'a = NOW()',
                    values: [],
                });
            });
            it('passes formatting options even when doing parameterized query', () => {
                const spy = mocker.spy(inst, '_formatValueForParamArray');

                const options = {
                    buildParameterized: true,
                    formattingOptions: {
                        dontQuote: true,
                    },
                };

                inst._buildString('a = ?', [3], options);

                assert.same(spy.getCall(0).args[1], options.formattingOptions);
            });
            describe('custom parameter character', () => {
                beforeEach(() => {
                    inst.options.parameterCharacter = '@@';
                });

                it('non-parameterized', () => {
                    assert.same(inst._buildString('a = @@', [[1, 2, 3]]), {
                        text: 'a = (1, 2, 3)',
                        values: [],
                    });
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildString('a = @@', [[1, 2, 3]], {
                            buildParameterized: true,
                        }),
                        {
                            text: 'a = (@@, @@, @@)',
                            values: [1, 2, 3],
                        }
                    );
                });
            });
        });

        describe('_buildManyStrings', () => {
            it('empty', () => {
                assert.same(inst._buildManyStrings([], []), {
                    text: '',
                    values: [],
                });
            });
            describe('simple', () => {
                beforeEach(() => {
                    this.strings = ['a = ?', 'b IN ? AND c = ?'];

                    this.values = [['elephant'], [[1, 2, 3], 4]];
                });

                it('non-parameterized', () => {
                    assert.same(
                        inst._buildManyStrings(this.strings, this.values),
                        {
                            text: "a = 'elephant' b IN (1, 2, 3) AND c = 4",
                            values: [],
                        }
                    );
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildManyStrings(this.strings, this.values, {
                            buildParameterized: true,
                        }),
                        {
                            text: 'a = ? b IN (?, ?, ?) AND c = ?',
                            values: ['elephant', 1, 2, 3, 4],
                        }
                    );
                });
            });

            describe('return nested', () => {
                it('non-parameterized', () => {
                    assert.same(
                        inst._buildManyStrings(['a = ?', 'b = ?'], [[1], [2]], {
                            nested: true,
                        }),
                        {
                            text: '(a = 1 b = 2)',
                            values: [],
                        }
                    );
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildManyStrings(['a = ?', 'b = ?'], [[1], [2]], {
                            buildParameterized: true,
                            nested: true,
                        }),
                        {
                            text: '(a = ? b = ?)',
                            values: [1, 2],
                        }
                    );
                });
            });

            describe('custom separator', () => {
                beforeEach(() => {
                    inst.options.separator = '|';
                });
                it('non-parameterized', () => {
                    assert.same(
                        inst._buildManyStrings(['a = ?', 'b = ?'], [[1], [2]]),
                        {
                            text: 'a = 1|b = 2',
                            values: [],
                        }
                    );
                });
                it('parameterized', () => {
                    assert.same(
                        inst._buildManyStrings(['a = ?', 'b = ?'], [[1], [2]], {
                            buildParameterized: true,
                        }),
                        {
                            text: 'a = ?|b = ?',
                            values: [1, 2],
                        }
                    );
                });
            });
        });
    });

    describe('QueryBuilder base class', () => {
        beforeEach(() => {
            inst = new QueryBuilder();
        });

        it('instanceof base builder', () => {
            assert.instanceOf(inst, BaseBuilder);
        });

        describe('constructor', () => {
            it('default options', () => {
                assert.same(DefaultQueryBuilderOptions, inst.options);
            });

            it('overridden options', () => {
                inst = new QueryBuilder({
                    dummy1: 'str',
                    dummy2: 12.3,
                    usingValuePlaceholders: true,
                    dummy3: true,
                });

                const expectedOptions = _.extend(
                    {},
                    DefaultQueryBuilderOptions,
                    {
                        dummy1: 'str',
                        dummy2: 12.3,
                        usingValuePlaceholders: true,
                        dummy3: true,
                    }
                );

                assert.same(expectedOptions, inst.options);
            });

            it('default blocks - none', () => {
                assert.same([], inst.blocks);
            });

            describe('blocks passed in', () => {
                it('exposes block methods', () => {
                    const limitExposedMethodsSpy = mocker.spy(
                        LimitBlock.prototype,
                        'exposedMethods'
                    );
                    const distinctExposedMethodsSpy = mocker.spy(
                        DistinctBlock.prototype,
                        'exposedMethods'
                    );
                    const limitSpy = mocker.spy(LimitBlock.prototype, 'limit');
                    const distinctSpy = mocker.spy(
                        DistinctBlock.prototype,
                        'distinct'
                    );

                    const blocks = [new LimitBlock(), new DistinctBlock()];

                    inst = new QueryBuilder({}, blocks);

                    assert.ok(limitExposedMethodsSpy.calledOnce);
                    assert.ok(distinctExposedMethodsSpy.calledOnce);

                    assert.typeOf(inst.distinct, 'function');
                    assert.typeOf(inst.limit, 'function');

                    assert.same(inst, inst.limit(2));
                    assert.ok(limitSpy.calledOnce);
                    assert.ok(limitSpy.calledOn(blocks[0]));

                    assert.same(inst, inst.distinct());
                    assert.ok(distinctSpy.calledOnce);
                    assert.ok(distinctSpy.calledOn(blocks[1]));
                });

                it('cannot expose the same method twice', () => {
                    const blocks = [new DistinctBlock(), new DistinctBlock()];

                    try {
                        inst = new QueryBuilder({}, blocks);
                        throw new Error('should not reach here');
                    } catch (err) {
                        assert.same(
                            'Error: Builder already has a builder method called: distinct',
                            err.toString()
                        );
                    }
                });
            });
        });

        describe('updateOptions()', () => {
            it('updates query builder options', () => {
                const oldOptions = _.extend({}, inst.options);

                inst.updateOptions({
                    updated: false,
                });

                const expected = _.extend(oldOptions, { updated: false });

                assert.same(expected, inst.options);
            });

            it('updates building block options', () => {
                inst.blocks = [new Block()];

                const oldOptions = _.extend({}, inst.blocks[0].options);

                inst.updateOptions({
                    updated: false,
                });

                const expected = _.extend(oldOptions, { updated: false });

                assert.same(expected, inst.blocks[0].options);
            });
        });

        describe('toString()', () => {
            it('returns empty if no blocks', () => {
                assert.same('', inst.toString());
            });

            it('skips empty block strings', () => {
                inst.blocks = [new StringBlock({}, '')];

                assert.same('', inst.toString());
            });

            it('returns final query string', () => {
                let i = 1;
                const toStringSpy = mocker.stub(
                    StringBlock.prototype,
                    '_toParamString',
                    () => ({
                        text: `ret${++i}`,
                        values: [],
                    })
                );

                inst.blocks = [
                    new StringBlock({}, 'STR1'),
                    new StringBlock({}, 'STR2'),
                    new StringBlock({}, 'STR3'),
                ];

                assert.same('ret2 ret3 ret4', inst.toString());

                assert.ok(toStringSpy.calledThrice);
                assert.ok(toStringSpy.calledOn(inst.blocks[0]));
                assert.ok(toStringSpy.calledOn(inst.blocks[1]));
                assert.ok(toStringSpy.calledOn(inst.blocks[2]));
            });
        });

        describe('toParam()', () => {
            it('returns empty if no blocks', () => {
                assert.same({ text: '', values: [] }, inst.toParam());
            });

            it('skips empty block strings', () => {
                inst.blocks = [new StringBlock({}, '')];

                assert.same({ text: '', values: [] }, inst.toParam());
            });

            it('returns final query string', () => {
                inst.blocks = [
                    new StringBlock({}, 'STR1'),
                    new StringBlock({}, 'STR2'),
                    new StringBlock({}, 'STR3'),
                ];

                let i = 1;
                const toStringSpy = mocker.stub(
                    StringBlock.prototype,
                    '_toParamString',
                    () => ({
                        text: `ret${++i}`,
                        values: [],
                    })
                );

                assert.same(
                    { text: 'ret2 ret3 ret4', values: [] },
                    inst.toParam()
                );

                assert.ok(toStringSpy.calledThrice);
                assert.ok(toStringSpy.calledOn(inst.blocks[0]));
                assert.ok(toStringSpy.calledOn(inst.blocks[1]));
                assert.ok(toStringSpy.calledOn(inst.blocks[2]));
            });

            it('returns query with unnumbered parameters', () => {
                inst.blocks = [new WhereBlock({})];

                inst.blocks[0]._toParamString = mocker.spy(() => ({
                    text: 'a = ? AND b in (?, ?)',
                    values: [1, 2, 3],
                }));

                assert.same(
                    { text: 'a = ? AND b in (?, ?)', values: [1, 2, 3] },
                    inst.toParam()
                );
            });

            it('returns query with numbered parameters', () => {
                inst = new QueryBuilder({
                    numberedParameters: true,
                });

                inst.blocks = [new WhereBlock({})];

                mocker.stub(WhereBlock.prototype, '_toParamString', () => ({
                    text: 'a = ? AND b in (?, ?)',
                    values: [1, 2, 3],
                }));

                assert.same(inst.toParam(), {
                    text: 'a = $1 AND b in ($2, $3)',
                    values: [1, 2, 3],
                });
            });

            it('returns query with numbered parameters and custom prefix', () => {
                inst = new QueryBuilder({
                    numberedParameters: true,
                    numberedParametersPrefix: '&%',
                });

                inst.blocks = [new WhereBlock({})];

                mocker.stub(WhereBlock.prototype, '_toParamString', () => ({
                    text: 'a = ? AND b in (?, ?)',
                    values: [1, 2, 3],
                }));

                assert.same(inst.toParam(), {
                    text: 'a = &%1 AND b in (&%2, &%3)',
                    values: [1, 2, 3],
                });
            });
        });

        describe('cloning', () => {
            it('blocks get cloned properly', () => {
                const blockCloneSpy = mocker.spy(
                    StringBlock.prototype,
                    'clone'
                );

                inst.blocks = [new StringBlock({}, 'TEST')];

                const newinst = inst.clone();

                inst.blocks[0].str = 'TEST2';

                assert.same('TEST', newinst.blocks[0].toString());
            });
        });

        describe('registerValueHandler', () => {
            let originalHandlers;

            it('beforEach', () => {
                originalHandlers = [].concat(squel.globalValueHandlers);
            });
            it('afterEach', () => {
                squel.globalValueHandlers = originalHandlers;
            });

            it('calls through to base class method', () => {
                const baseBuilderSpy = mocker.spy(
                    BaseBuilder.prototype,
                    'registerValueHandler'
                );

                const handler = () => 'test';

                inst.registerValueHandler(Date, handler);
                inst.registerValueHandler('number', handler);

                assert.ok(baseBuilderSpy.calledTwice);
                assert.ok(baseBuilderSpy.calledOn(inst));
            });

            it('returns instance for chainability', () => {
                const handler = () => 'test';

                assert.same(inst, inst.registerValueHandler(Date, handler));
            });

            it('calls through to blocks', () => {
                inst.blocks = [new StringBlock({}, '')];

                const baseBuilderSpy = mocker.spy(
                    inst.blocks[0],
                    'registerValueHandler'
                );

                const handler = () => 'test';

                inst.registerValueHandler(Date, handler);

                assert.ok(baseBuilderSpy.calledOnce);
                assert.ok(baseBuilderSpy.calledOn(inst.blocks[0]));
            });
        });

        describe('get block', () => {
            it('valid', () => {
                const block = new FunctionBlock();

                inst.blocks.push(block);
                assert.same(block, inst.getBlock(FunctionBlock));
            });
            it('invalid', () => {
                assert.same(undefined, inst.getBlock(FunctionBlock));
            });
        });
    });
});
