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

import sinon from "sinon";
import _ from "underscore";
import { squel } from "../src";
import { StringBlock } from "../src/block";
import { DefaultQueryBuilderOptions } from "../src/base-builder";
import { QueryBuilder } from "../src/query-builder";

import { assert } from "chai";

let mocker;

assert.same = function (actual, expected, message) {
    return assert.deepEqual(actual, expected, message);
};

describe("Base Classes", () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
    });

    afterEach(() => {
        mocker.restore();
    });

    it("Version number", () => {
        assert.same(squel.VERSION, require("../package.json").version);
    });

    it("Default flavour", () => {
        assert.isNull(squel.flavour);
    });

    describe("Cloneable Base Class", () => {
        it("Clone", () => {
            class Child extends squel.cls.Cloneable {
                constructor() {
                    this.a = 1;
                    this.b = 2.2;
                    this.c = true;
                    this.d = "str";
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
            child.d = "str2";
            child.e.push(2);
            child.f.b = 1;

            assert.same(copy.a, 1);
            assert.same(copy.b, 2.2);
            assert.same(copy.c, true);
            assert.same(copy.d, "str");
            assert.same(copy.e, [1]);
            assert.same(copy.f, { a: 1 });
        });
    });

    describe("Default query builder options", () => {
        assert.same(
            {
                autoQuoteTableNames: false,
                autoQuoteFieldNames: false,
                autoQuoteAliasNames: true,
                useAsForTableAliasNames: false,
                nameQuoteCharacter: "`",
                tableAliasQuoteCharacter: "`",
                fieldAliasQuoteCharacter: '"',
                valueHandlers: [],
                parameterCharacter: "?",
                numberedParameters: false,
                numberedParametersPrefix: "$",
                numberedParametersStartAt: 1,
                replaceSingleQuotes: false,
                singleQuoteReplacement: "''",
                separator: " ",
                stringFormatter: null,
                rawNesting: false,
            },
            DefaultQueryBuilderOptions
        );
    });

    describe("Register global custom value handler", () => {
        beforeEach(() => {
            this.originalHandlers = [].concat(squel.cls.globalValueHandlers);
            return (squel.cls.globalValueHandlers = []);
        });

        afterEach(() => {
            return (squel.cls.globalValueHandlers = this.originalHandlers);
        });

        it("default", () => {
            const handler = () => "test";

            squel.registerValueHandler(Date, handler);
            squel.registerValueHandler(Object, handler);
            squel.registerValueHandler("boolean", handler);

            assert.same(3, squel.cls.globalValueHandlers.length);
            assert.same(
                { type: Date, handler },
                squel.cls.globalValueHandlers[0]
            );
            assert.same(
                { type: Object, handler },
                squel.cls.globalValueHandlers[1]
            );
            assert.same(
                { type: "boolean", handler },
                squel.cls.globalValueHandlers[2]
            );
        });

        it("type should be class constructor", () => {
            assert.throws(
                () => squel.registerValueHandler(1, null),
                "type must be a class constructor or string"
            );
        });

        it("handler should be function", () => {
            class MyClass {}

            assert.throws(
                () => squel.registerValueHandler(MyClass, 1),
                "handler must be a function"
            );
        });

        it("overrides existing handler", () => {
            const handler = () => "test";
            const handler2 = () => "test2";
            squel.registerValueHandler(Date, handler);
            squel.registerValueHandler(Date, handler2);

            assert.same(1, squel.cls.globalValueHandlers.length);
            return assert.same(
                { type: Date, handler: handler2 },
                squel.cls.globalValueHandlers[0]
            );
        });
    });
});

// test['str()'] = {
//   constructor() {
//     const f = squel.str('GETDATE(?)', 12, 23);
//     assert.ok((f instanceof squel.cls.FunctionBlock));
//     assert.same('GETDATE(?)', f._strings[0]);
//     return assert.same([12, 23], f._values[0]);
//   },

//   'custom value handler': {
//     beforeEach() {
//       this.inst = squel.str('G(?,?)', 12, 23, 65);

//       const handlerConfig = _.find(squel.cls.globalValueHandlers, hc => hc.type === squel.cls.FunctionBlock);

//       return this.handler = handlerConfig.handler;
//     },

//     toString() {
//       return assert.same(this.inst.toString(), this.handler(this.inst));
//     },
//     toParam() {
//       return assert.same(this.inst.toParam(), this.handler(this.inst, true));
//     }
//   }
// };

// test['rstr()'] = {
//   constructor() {
//     const f = squel.rstr('GETDATE(?)', 12, 23);
//     assert.ok((f instanceof squel.cls.FunctionBlock));
//     assert.same('GETDATE(?)', f._strings[0]);
//     return assert.same([12, 23], f._values[0]);
//   },

//   vsStr() {
//     const f1 = squel.str('OUTER(?)', squel.str('INNER(?)', 2));
//     assert.same('OUTER((INNER(2)))', f1.toString());
//     const f2 = squel.str('OUTER(?)', squel.rstr('INNER(?)', 2));
//     return assert.same('OUTER(INNER(2))', f2.toString());
//   },

//   'custom value handler': {
//     beforeEach() {
//       this.inst = squel.rstr('G(?,?)', 12, 23, 65);

//       const handlerConfig = _.find(squel.cls.globalValueHandlers, hc => hc.type === squel.cls.FunctionBlock);

//       return this.handler = handlerConfig.handler;
//     },

//     toString() {
//       return assert.same(this.inst.toString(), this.handler(this.inst));
//     },
//     toParam() {
//       return assert.same(this.inst.toParam(), this.handler(this.inst, true));
//     }
//   }
// };

// test['Load an SQL flavour'] = {
//   beforeEach() {
//     this.flavoursBackup = squel.flavours;
//     return squel.flavours = {};
//   },

//   afterEach() {
//     return squel.flavours = this.flavoursBackup;
//   },

//   'invalid flavour'() {
//     return assert.throws((() => squel.useFlavour('test')), 'Flavour not available: test');
//   },

//   'flavour reference should be a function'() {
//     squel.flavours['test'] = 'blah';
//     return assert.throws((() => squel.useFlavour('test')), 'Flavour not available: test');
//   },

//   'flavour setup function gets executed'() {
//     squel.flavours['test'] = test.mocker.spy();
//     const ret = squel.useFlavour('test');
//     assert.ok(squel.flavours['test'].calledOnce);
//     return assert.ok(!!ret.select());
//   },

//   'can switch flavours'() {
//     squel.flavours['test'] = test.mocker.spy( s => s.cls.dummy = 1);
//     squel.flavours['test2'] = test.mocker.spy( s => s.cls.dummy2 = 2);
//     let ret = squel.useFlavour('test');
//     assert.same(ret.cls.dummy, 1);

//     ret = squel.useFlavour('test2');
//     assert.same(ret.cls.dummy, undefined);
//     assert.same(ret.cls.dummy2, 2);

//     ret = squel.useFlavour();
//     assert.same(ret.cls.dummy, undefined);
//     return assert.same(ret.cls.dummy2, undefined);
//   },

//   'can get current flavour'() {
//     const flavour = 'test';
//     squel.flavours[flavour] = test.mocker.spy();

//     const ret = squel.useFlavour(flavour);
//     return assert.same(ret.flavour, flavour);
//   },

//   'can mix flavours - #255'() {
//     squel.flavours.flavour1 = s => s;
//     squel.flavours.flavour2 = s => s;
//     const squel1 = squel.useFlavour('flavour1');
//     const squel2 = squel.useFlavour('flavour2');

//     const expr1 = squel1.expr().and('1 = 1');
//     return assert.same(squel2.select().from('test', 't').where(expr1).toString(), 'SELECT * FROM test `t` WHERE (1 = 1)');
//   }
// };

// test['Builder base class'] = {
//   beforeEach() {
//     this.cls = squel.cls.BaseBuilder;
//     this.inst = new this.cls;

//     return this.originalHandlers = [].concat(squel.cls.globalValueHandlers);
//   },

//   afterEach() {
//     return squel.cls.globalValueHandlers = this.originalHandlers;
//   },

//   'instanceof Cloneable'() {
//     return assert.instanceOf(this.inst, squel.cls.Cloneable);
//   },

//   'constructor': {
//     'default options'() {
//       return assert.same(squel.cls.DefaultQueryBuilderOptions, this.inst.options);
//     },

//     'overridden options'() {
//       this.inst = new this.cls({
//         dummy1: 'str',
//         dummy2: 12.3,
//         usingValuePlaceholders: true,
//         dummy3: true,
//         globalValueHandlers: [1]});

//       const expectedOptions = _.extend({}, squel.cls.DefaultQueryBuilderOptions, {
//         dummy1: 'str',
//         dummy2: 12.3,
//         usingValuePlaceholders: true,
//         dummy3: true,
//         globalValueHandlers: [1]
//       });

//       return assert.same(expectedOptions, this.inst.options);
//     }
//   },

//   'registerValueHandler': {
//     'afterEach'() {
//       return squel.cls.globalValueHandlers = [];
//     },

//     'default'() {
//       const handler = () => 'test';
//       this.inst.registerValueHandler(Date, handler);
//       this.inst.registerValueHandler(Object, handler);
//       this.inst.registerValueHandler('number', handler);

//       assert.same(3, this.inst.options.valueHandlers.length);
//       assert.same({ type: Date, handler }, this.inst.options.valueHandlers[0]);
//       assert.same({ type: Object, handler }, this.inst.options.valueHandlers[1]);
//       return assert.same({ type: 'number', handler }, this.inst.options.valueHandlers[2]);
//     },

//     'type should be class constructor'() {
//       return assert.throws((() => this.inst.registerValueHandler(1, null)), "type must be a class constructor or string");
//     },

//     'handler should be function'() {
//       class MyClass {}
//       return assert.throws((() => this.inst.registerValueHandler(MyClass, 1)), 'handler must be a function');
//     },

//     'returns instance for chainability'() {
//       const handler = () => 'test';
//       return assert.same(this.inst, this.inst.registerValueHandler(Date, handler));
//     },

//     'overrides existing handler'() {
//       const handler = () => 'test';
//       const handler2 = () => 'test2';
//       this.inst.registerValueHandler(Date, handler);
//       this.inst.registerValueHandler(Date, handler2);

//       assert.same(1, this.inst.options.valueHandlers.length);
//       return assert.same({ type: Date, handler: handler2 }, this.inst.options.valueHandlers[0]);
//     },

//     'does not touch global value handlers list'() {
//       const oldGlobalHandlers = squel.cls.globalValueHandlers;

//       const handler = () => 'test';
//       this.inst.registerValueHandler(Date, handler);

//       return assert.same(oldGlobalHandlers, squel.cls.globalValueHandlers);
//     }
//   },

//   '_sanitizeExpression': {
//     'if Expression': {
//       'empty expression'() {
//         const e = squel.expr();
//         return assert.same(e, this.inst._sanitizeExpression(e));
//       },
//       'non-empty expression'() {
//         const e = squel.expr().and("s.name <> 'Fred'");
//         return assert.same(e, this.inst._sanitizeExpression(e));
//       }
//     },

//     'if Expression'() {
//       const s = squel.str('s');
//       return assert.same(s, this.inst._sanitizeExpression(s));
//     },

//     'if string'() {
//       const s = 'BLA BLA';
//       return assert.same('BLA BLA', this.inst._sanitizeExpression(s));
//     },

//     'if neither expression, builder nor String'() {
//       const testFn = () => this.inst._sanitizeExpression(1);
//       return assert.throws(testFn, 'expression must be a string or builder instance');
//     }
//   },

//   '_sanitizeName': {
//     beforeEach() {
//       return test.mocker.spy(this.inst, '_sanitizeName');
//     },

//     'if string'() {
//       return assert.same('bla', this.inst._sanitizeName('bla'));
//     },

//     'if boolean'() {
//       return assert.throws((() => this.inst._sanitizeName(true, 'bla')), 'bla must be a string');
//     },

//     'if integer'() {
//       return assert.throws((() => this.inst._sanitizeName(1)), 'undefined must be a string');
//     },

//     'if float'() {
//       return assert.throws((() => this.inst._sanitizeName(1.2, 'meh')), 'meh must be a string');
//     },

//     'if array'() {
//       return assert.throws((() => this.inst._sanitizeName([1], 'yes')), 'yes must be a string');
//     },

//     'if object'() {
//       return assert.throws((() => this.inst._sanitizeName(new Object, 'yes')), 'yes must be a string');
//     },

//     'if null'() {
//       return assert.throws((() => this.inst._sanitizeName(null, 'no')), 'no must be a string');
//     },

//     'if undefined'() {
//       return assert.throws((() => this.inst._sanitizeName(undefined, 'no')), 'no must be a string');
//     }
//   },

//   '_sanitizeField': {
//     'default'() {
//       test.mocker.spy(this.inst, '_sanitizeName');

//       assert.same('abc', this.inst._sanitizeField('abc'));

//       return assert.ok(this.inst._sanitizeName.calledWithExactly('abc', 'field name'));
//     },

//     'QueryBuilder'() {
//       const s = squel.select().from('scores').field('MAX(score)');
//       return assert.same(s, this.inst._sanitizeField(s));
//     }
//   },

//   '_sanitizeBaseBuilder': {
//     'is not base builder'() {
//       return assert.throws((() => this.inst._sanitizeBaseBuilder(null)), 'must be a builder instance');
//     },

//     'is a query builder'() {
//       const qry = squel.select();
//       return assert.same(qry, this.inst._sanitizeBaseBuilder(qry));
//     }
//   },

//   '_sanitizeTable': {
//     'default'() {
//       test.mocker.spy(this.inst, '_sanitizeName');

//       assert.same('abc', this.inst._sanitizeTable('abc'));

//       return assert.ok(this.inst._sanitizeName.calledWithExactly('abc', 'table'));
//     },

//     'not a string'() {
//       return assert.throws((() => this.inst._sanitizeTable(null)), 'table name must be a string or a builder');
//     },

//     'query builder'() {
//       const select = squel.select();
//       return assert.same(select, this.inst._sanitizeTable(select, true));
//     }
//   },

//   '_sanitizeFieldAlias'() {
//     return {
//       'default'() {
//         test.mocker.spy(this.inst, '_sanitizeName');

//         this.inst._sanitizeFieldAlias('abc');

//         return assert.ok(this.inst._sanitizeName.calledWithExactly('abc', 'field alias'));
//       }
//     };
//   },

//   '_sanitizeTableAlias'() {
//     return {
//       'default'() {
//         test.mocker.spy(this.inst, '_sanitizeName');

//         this.inst._sanitizeTableAlias('abc');

//         return assert.ok(this.inst._sanitizeName.calledWithExactly('abc', 'table alias'));
//       }
//     };
//   },

//   '_sanitizeLimitOffset': {
//     'undefined'() {
//       return assert.throws((() => this.inst._sanitizeLimitOffset()), 'limit/offset must be >= 0');
//     },

//     'null'() {
//       return assert.throws((() => this.inst._sanitizeLimitOffset(null)), 'limit/offset must be >= 0');
//     },

//     'float'() {
//       return assert.same(1, this.inst._sanitizeLimitOffset(1.2));
//     },

//     'boolean'() {
//       return assert.throws((() => this.inst._sanitizeLimitOffset(false)), 'limit/offset must be >= 0');
//     },

//     'string'() {
//       return assert.same(2, this.inst._sanitizeLimitOffset('2'));
//     },

//     'array'() {
//       return assert.same(3, this.inst._sanitizeLimitOffset([3]));
//     },

//     'object'() {
//       return assert.throws((() => this.inst._sanitizeLimitOffset(new Object)), 'limit/offset must be >= 0');
//     },

//     'number >= 0'() {
//       assert.same(0, this.inst._sanitizeLimitOffset(0));
//       return assert.same(1, this.inst._sanitizeLimitOffset(1));
//     },

//     'number < 0'() {
//       return assert.throws((() => this.inst._sanitizeLimitOffset(-1)), 'limit/offset must be >= 0');
//     }
//   },

//   '_sanitizeValue': {
//     beforeEach() {
//       return test.mocker.spy(this.inst, '_sanitizeValue');
//     },

//     afterEach() {
//       return squel.cls.globalValueHandlers = [];
//     },

//     'if string'() {
//       return assert.same('bla', this.inst._sanitizeValue('bla'));
//     },

//     'if boolean'() {
//       assert.same(true, this.inst._sanitizeValue(true));
//       return assert.same(false, this.inst._sanitizeValue(false));
//     },

//     'if integer'() {
//       assert.same(-1, this.inst._sanitizeValue(-1));
//       assert.same(0, this.inst._sanitizeValue(0));
//       return assert.same(1, this.inst._sanitizeValue(1));
//     },

//     'if float'() {
//       assert.same(-1.2, this.inst._sanitizeValue(-1.2));
//       return assert.same(1.2, this.inst._sanitizeValue(1.2));
//     },

//     'if array'() {
//       return assert.throws((() => this.inst._sanitizeValue([1])), 'field value must be a string, number, boolean, null or one of the registered custom value types');
//     },

//     'if object'() {
//       return assert.throws((() => this.inst._sanitizeValue(new Object)), 'field value must be a string, number, boolean, null or one of the registered custom value types');
//     },

//     'if null'() {
//       return assert.same(null, this.inst._sanitizeValue(null));
//     },

//     'if BaseBuilder'() {
//       const s = squel.select();
//       return assert.same(s, this.inst._sanitizeValue(s));
//     },

//     'if undefined'() {
//       return assert.throws((() => this.inst._sanitizeValue(undefined)), 'field value must be a string, number, boolean, null or one of the registered custom value types');
//     },

//     'custom handlers': {
//       'global'() {
//         squel.registerValueHandler(Date, _.identity);
//         const date = new Date;
//         return assert.same(date, this.inst._sanitizeValue(date));
//       },

//       'instance'() {
//         this.inst.registerValueHandler(Date, _.identity);
//         const date = new Date;
//         return assert.same(date, this.inst._sanitizeValue(date));
//       }
//     }
//   },

//   '_escapeValue'() {
//       this.inst.options.replaceSingleQuotes = false;
//       assert.same("te'st", this.inst._escapeValue("te'st"));

//       this.inst.options.replaceSingleQuotes = true;
//       assert.same("te''st", this.inst._escapeValue("te'st"));

//       this.inst.options.singleQuoteReplacement = '--';
//       assert.same("te--st", this.inst._escapeValue("te'st"));

//       this.inst.options.singleQuoteReplacement = '--';
//       return assert.same(undefined, this.inst._escapeValue());
//     },

//   '_formatTableName': {
//     'default'() {
//       return assert.same('abc', this.inst._formatTableName('abc'));
//     },

//     'auto quote names': {
//       beforeEach() {
//         return this.inst.options.autoQuoteTableNames = true;
//       },

//       'default quote character'() {
//         return assert.same('`abc`', this.inst._formatTableName('abc'));
//       },

//       'custom quote character'() {
//         this.inst.options.nameQuoteCharacter = '|';
//         return assert.same('|abc|', this.inst._formatTableName('abc'));
//       }
//     }
//   },

//   '_formatTableAlias': {
//     'default'() {
//       return assert.same('`abc`', this.inst._formatTableAlias('abc'));
//     },

//     'custom quote character'() {
//       this.inst.options.tableAliasQuoteCharacter = '~';
//       return assert.same('~abc~', this.inst._formatTableAlias('abc'));
//     },

//     'auto quote alias names is OFF'() {
//       this.inst.options.autoQuoteAliasNames = false;
//       return assert.same('abc', this.inst._formatTableAlias('abc'));
//     },

//     'AS is turned ON'() {
//       this.inst.options.autoQuoteAliasNames = false;
//       this.inst.options.useAsForTableAliasNames = true;
//       return assert.same('AS abc', this.inst._formatTableAlias('abc'));
//     }
//   },

//   '_formatFieldAlias': {
//     default() {
//       return assert.same('"abc"', this.inst._formatFieldAlias('abc'));
//     },

//     'custom quote character'() {
//       this.inst.options.fieldAliasQuoteCharacter = '~';
//       return assert.same('~abc~', this.inst._formatFieldAlias('abc'));
//     },

//     'auto quote alias names is OFF'() {
//       this.inst.options.autoQuoteAliasNames = false;
//       return assert.same('abc', this.inst._formatFieldAlias('abc'));
//     }
//   },

//   '_formatFieldName': {
//     default() {
//       return assert.same('abc', this.inst._formatFieldName('abc'));
//     },

//     'auto quote names': {
//       beforeEach() {
//         return this.inst.options.autoQuoteFieldNames = true;
//       },

//       'default quote character'() {
//         return assert.same('`abc`.`def`', this.inst._formatFieldName('abc.def'));
//       },

//       'do not quote *'() {
//         return assert.same('`abc`.*', this.inst._formatFieldName('abc.*'));
//       },

//       'custom quote character'() {
//         this.inst.options.nameQuoteCharacter = '|';
//         return assert.same('|abc|.|def|', this.inst._formatFieldName('abc.def'));
//       },

//       'ignore periods when quoting'() {
//         return assert.same('`abc.def`', this.inst._formatFieldName('abc.def', {ignorePeriodsForFieldNameQuotes: true}));
//       }
//     }
//   },

//   '_formatCustomValue': {
//     'not a custom value type'() {
//       assert.same({ formatted: false, value: null }, this.inst._formatCustomValue(null));
//       assert.same({ formatted: false, value: 'abc' }, this.inst._formatCustomValue('abc'));
//       assert.same({ formatted: false, value: 12 }, this.inst._formatCustomValue(12));
//       assert.same({ formatted: false, value: 1.2 }, this.inst._formatCustomValue(1.2));
//       assert.same({ formatted: false, value: true }, this.inst._formatCustomValue(true));
//       return assert.same({ formatted: false, value: false }, this.inst._formatCustomValue(false));
//     },

//     'custom value type': {
//       'global'() {
//         class MyClass {}
//         const myObj = new MyClass;

//         squel.registerValueHandler(MyClass, () => 3.14);
//         squel.registerValueHandler('boolean', v => 'a' + v);

//         assert.same({ formatted: true, value: 3.14 }, this.inst._formatCustomValue(myObj));
//         return assert.same({ formatted: true, value: 'atrue' }, this.inst._formatCustomValue(true));
//       },

//       'instance'() {
//         class MyClass {}
//         const myObj = new MyClass;

//         this.inst.registerValueHandler(MyClass, () => 3.14);
//         this.inst.registerValueHandler('number', v => v + 'a');

//         assert.same({ formatted: true, value: 3.14}, this.inst._formatCustomValue(myObj));
//         return assert.same({ formatted: true, value: '5.2a'}, this.inst._formatCustomValue(5.2));
//       },

//       'instance handler takes precedence over global'() {
//         this.inst.registerValueHandler(Date, d => 'hello');
//         squel.registerValueHandler(Date, d => 'goodbye');

//         assert.same({ formatted: true, value: "hello"}, this.inst._formatCustomValue(new Date));

//         this.inst = new this.cls({
//           valueHandlers: []});
//         return assert.same({ formatted: true, value: "goodbye"}, this.inst._formatCustomValue(new Date));
//       },

//       'whether to format for parameterized output'() {
//         this.inst.registerValueHandler(Date, function(d, asParam) {
//           if (asParam) { return 'foo'; } else { return 'bar'; }
//         });

//         const val = new Date();

//         assert.same({ formatted: true, value: 'foo'}, this.inst._formatCustomValue(val, true));
//         return assert.same({ formatted: true, value: 'bar'}, this.inst._formatCustomValue(val));
//       },

//       'additional formatting options'() {
//         this.inst.registerValueHandler(Date, function(d, asParam, options) {
//           if (options.dontQuote) { return 'foo'; } else { return '"foo"'; }
//         });

//         const val = new Date();

//         assert.same({ formatted: true, value: 'foo'}, this.inst._formatCustomValue(val, true, { dontQuote: true }));
//         return assert.same({ formatted: true, value: '"foo"'}, this.inst._formatCustomValue(val, true, { dontQuote: false }));
//       },

//       'return raw'() {
//         this.inst.registerValueHandler(Date, d => ({
//           rawNesting: true,
//           value: 'foo'
//         }));

//         const val = new Date();

//         return assert.same({ rawNesting: true, formatted: true, value: 'foo'}, this.inst._formatCustomValue(val, true));
//       }
//     }
//   },

//   '_formatValueForParamArray': {
//     'Query builder'() {
//       const s = squel.select().from('table');
//       return assert.same(s, this.inst._formatValueForParamArray(s));
//     },

//     'else calls _formatCustomValue'() {
//       const spy = test.mocker.stub(this.inst, '_formatCustomValue', (v, asParam) => ({
//         formatted: true,
//         value: 'test' + (asParam ? 'foo' : 'bar')
//       }));

//       assert.same('testfoo', this.inst._formatValueForParamArray(null));
//       assert.same('testfoo', this.inst._formatValueForParamArray('abc'));
//       assert.same('testfoo', this.inst._formatValueForParamArray(12));
//       assert.same('testfoo', this.inst._formatValueForParamArray(1.2));

//       const opts = { dummy: true };
//       assert.same('testfoo', this.inst._formatValueForParamArray(true, opts));

//       assert.same('testfoo', this.inst._formatValueForParamArray(false));

//       assert.same(6, spy.callCount);

//       return assert.same(spy.getCall(4).args[2], opts);
//     },

//     'Array - recursively calls itself on each element'() {
//       const spy = test.mocker.spy(this.inst, '_formatValueForParamArray');

//       const v = [ squel.select().from('table'), 1.2 ];

//       const opts = { dummy: true };
//       const res = this.inst._formatValueForParamArray(v, opts);

//       assert.same(v, res);

//       assert.same(3, spy.callCount);
//       assert.ok(spy.calledWith(v[0]));
//       assert.ok(spy.calledWith(v[1]));

//       return assert.same(spy.getCall(1).args[1], opts);
//     }
//   },

//   '_formatValueForQueryString': {
//     'null'() {
//       return assert.same('NULL', this.inst._formatValueForQueryString(null));
//     },

//     'boolean'() {
//       assert.same('TRUE', this.inst._formatValueForQueryString(true));
//       return assert.same('FALSE', this.inst._formatValueForQueryString(false));
//     },

//     'integer'() {
//       return assert.same(12, this.inst._formatValueForQueryString(12));
//     },

//     'float'() {
//       return assert.same(1.2, this.inst._formatValueForQueryString(1.2));
//     },

//     'string': {
//       'have string formatter function'() {
//         this.inst.options.stringFormatter = str => `N(${str})`;

//         return assert.same("N(test)", this.inst._formatValueForQueryString('test'));
//       },

//       'default'() {
//         let escapedValue = undefined;
//         test.mocker.stub(this.inst, '_escapeValue', str => escapedValue || str);

//         assert.same("'test'", this.inst._formatValueForQueryString('test'));

//         assert.ok(this.inst._escapeValue.calledWithExactly('test'));
//         escapedValue = 'blah';
//         return assert.same("'blah'", this.inst._formatValueForQueryString('test'));
//       },

//       'dont quote'() {
//         const escapedValue = undefined;
//         test.mocker.stub(this.inst, '_escapeValue', str => escapedValue || str);

//         assert.same("test", this.inst._formatValueForQueryString('test', {dontQuote: true} ));

//         return assert.ok(this.inst._escapeValue.notCalled);
//       }
//     },

//     'Array - recursively calls itself on each element'() {
//       const spy = test.mocker.spy(this.inst, '_formatValueForQueryString');

//       const expected = "('test', 123, TRUE, 1.2, NULL)";
//       assert.same(expected, this.inst._formatValueForQueryString([ 'test', 123, true, 1.2, null ]));

//       assert.same(6, spy.callCount);
//       assert.ok(spy.calledWith('test'));
//       assert.ok(spy.calledWith(123));
//       assert.ok(spy.calledWith(true));
//       assert.ok(spy.calledWith(1.2));
//       return assert.ok(spy.calledWith(null));
//     },

//     'BaseBuilder'() {
//       const spy = test.mocker.stub(this.inst, '_applyNestingFormatting', v => `{{${v}}}`);
//       const s = squel.select().from('table');
//       return assert.same('{{SELECT * FROM table}}', this.inst._formatValueForQueryString(s));
//     },

//     'checks to see if it is custom value type first'() {
//       test.mocker.stub(this.inst, '_formatCustomValue', (val, asParam) => ({
//         formatted: true,
//         value: 12 + (asParam ? 25 : 65)
//       }));
//       test.mocker.stub(this.inst, '_applyNestingFormatting', v => `{${v}}`);
//       return assert.same('{77}', this.inst._formatValueForQueryString(123));
//     },

//     '#292 - custom value type specifies raw nesting'() {
//       test.mocker.stub(this.inst, '_formatCustomValue', (val, asParam) => ({
//         rawNesting: true,
//         formatted: true,
//         value: 12
//       }));
//       test.mocker.stub(this.inst, '_applyNestingFormatting', v => `{${v}}`);
//       return assert.same(12, this.inst._formatValueForQueryString(123));
//     }
//   },

//   '_applyNestingFormatting': {
//     default() {
//       assert.same('(77)', this.inst._applyNestingFormatting('77'));
//       assert.same('((77)', this.inst._applyNestingFormatting('(77'));
//       assert.same('(77))', this.inst._applyNestingFormatting('77)'));
//       return assert.same('(77)', this.inst._applyNestingFormatting('(77)'));
//     },
//     'no nesting'() {
//       return assert.same('77', this.inst._applyNestingFormatting('77', false));
//     },
//     'rawNesting turned on'() {
//       this.inst = new this.cls({ rawNesting: true });
//       return assert.same('77', this.inst._applyNestingFormatting('77'));
//     }
//   },

//   '_buildString': {
//     'empty'() {
//       return assert.same(this.inst._buildString('', []), {
//         text: '',
//         values: [],
//       });
//     },
//     'no params': {
//       'non-parameterized'() {
//         return assert.same(this.inst._buildString('abc = 3', []), {
//           text: 'abc = 3',
//           values: []
//         });
//       },
//       'parameterized'() {
//         return assert.same(this.inst._buildString('abc = 3', [], { buildParameterized: true }), {
//           text: 'abc = 3',
//           values: []
//         });
//       }
//     },
//     'non-array': {
//       'non-parameterized'() {
//         return assert.same(this.inst._buildString('a = ? ? ? ?', [2, 'abc', false, null]), {
//           text: 'a = 2 \'abc\' FALSE NULL',
//           values: []
//         });
//       },
//       'parameterized'() {
//         return assert.same(this.inst._buildString('a = ? ? ? ?', [2, 'abc', false, null], { buildParameterized: true }), {
//           text: 'a = ? ? ? ?',
//           values: [2, 'abc', false, null]
//         });
//       }
//     },
//     'array'() {
//       return {
//         'non-parameterized'() {
//           return assert.same(this.inst._buildString('a = ?', [[1,2,3]]), {
//             text: 'a = (1, 2, 3)',
//             values: [],
//           });
//         },
//         'parameterized'() {
//           return assert.same(this.inst._buildString('a = ?', [[1,2,3]], { buildParameterized: true }), {
//             text: 'a = (?, ?, ?)',
//             values: [1, 2, 3]
//           });
//         }
//       };
//     },
//     'nested builder'() {
//       return {
//         beforeEach:
//           (this.s = squel.select().from('master').where('b = ?', 5)),
//         'non-parameterized'() {
//           return assert.same(this.inst._buildString('a = ?', [this.s]), {
//             text: 'a = (SELECT * FROM master WHERE (b = 5))',
//             values: []
//           });
//         },
//         'parameterized'() {
//           return assert.same(this.inst._buildString('a = ?', [this.s], { buildParameterized: true }), {
//             text: 'a = (SELECT * FROM master WHERE (b = ?))',
//             values: [5]
//           });
//         }
//       };
//     },
//     'return nested output': {
//       'non-parameterized'() {
//         return assert.same(this.inst._buildString('a = ?', [3], { nested: true }), {
//           text: '(a = 3)',
//           values: []
//         });
//       },
//       'parameterized'() {
//         return assert.same(this.inst._buildString('a = ?', [3], { buildParameterized: true, nested: true }), {
//           text: '(a = ?)',
//           values: [3]
//         });
//       }
//     },
//     'string formatting options'() {
//       const options = {
//         formattingOptions: {
//           dontQuote: true
//         }
//       };

//       return assert.same(this.inst._buildString('a = ?', ['NOW()'], options), {
//         text: 'a = NOW()',
//         values: []
//       });
//     },
//     'passes formatting options even when doing parameterized query'() {
//       const spy = test.mocker.spy(this.inst, '_formatValueForParamArray');

//       const options = {
//         buildParameterized: true,
//         formattingOptions: {
//           dontQuote: true
//         }
//       };

//       this.inst._buildString('a = ?', [3], options);

//       return assert.same(spy.getCall(0).args[1], options.formattingOptions);
//     },
//     'custom parameter character': {
//       beforeEach() {
//         return this.inst.options.parameterCharacter = '@@';
//       },

//       'non-parameterized'() {
//         return assert.same(this.inst._buildString('a = @@', [[1,2,3]]), {
//           text: 'a = (1, 2, 3)',
//           values: [],
//         });
//       },
//       'parameterized'() {
//         return assert.same(this.inst._buildString('a = @@', [[1,2,3]], { buildParameterized: true }), {
//           text: 'a = (@@, @@, @@)',
//           values: [1,2,3],
//         });
//       }
//     }
//   },

//   '_buildManyStrings': {
//     'empty'() {
//       return assert.same(this.inst._buildManyStrings([], []), {
//         text: '',
//         values: [],
//       });
//     },
//     'simple': {
//       beforeEach() {
//         this.strings = [
//           'a = ?',
//           'b IN ? AND c = ?'
//         ];

//         return this.values = [
//           ['elephant'],
//           [[1,2,3], 4]
//         ];
//       },

//       'non-parameterized'() {
//         return assert.same(this.inst._buildManyStrings(this.strings, this.values), {
//           text: 'a = \'elephant\' b IN (1, 2, 3) AND c = 4',
//           values: [],
//         });
//       },
//       'parameterized'() {
//         return assert.same(this.inst._buildManyStrings(this.strings, this.values, { buildParameterized: true }), {
//           text: 'a = ? b IN (?, ?, ?) AND c = ?',
//           values: ['elephant', 1, 2, 3, 4],
//         });
//       }
//     },

//     'return nested': {
//       'non-parameterized'() {
//         return assert.same(this.inst._buildManyStrings(['a = ?', 'b = ?'], [[1], [2]], { nested: true }), {
//           text: '(a = 1 b = 2)',
//           values: [],
//         });
//       },
//       'parameterized'() {
//         return assert.same(this.inst._buildManyStrings(['a = ?', 'b = ?'], [[1], [2]], { buildParameterized: true, nested: true }), {
//           text: '(a = ? b = ?)',
//           values: [1, 2],
//         });
//       }
//     },

//     'custom separator': {
//       beforeEach() {
//         return this.inst.options.separator = '|';
//       },
//       'non-parameterized'() {
//         return assert.same(this.inst._buildManyStrings(['a = ?', 'b = ?'], [[1], [2]]), {
//           text: 'a = 1|b = 2',
//           values: [],
//         });
//       },
//       'parameterized'() {
//         return assert.same(this.inst._buildManyStrings(['a = ?', 'b = ?'], [[1], [2]], { buildParameterized: true}), {
//           text: 'a = ?|b = ?',
//           values: [1, 2],
//         });
//       }
//     }
//   },

//   'toParam'() {
//     const spy = test.mocker.stub(this.inst, '_toParamString', () => ({
//       text: 'dummy',
//       values: [1]
//     }));

//     const options = {test: 2};
//     assert.same(this.inst.toParam(options), {
//       text: 'dummy',
//       values: [1]
//     });

//     spy.should.have.been.calledOnce;
//     assert.same(spy.getCall(0).args[0].test, 2);
//     return assert.same(spy.getCall(0).args[0].buildParameterized, true);
//   },

//   'toString'() {
//     const spy = test.mocker.stub(this.inst, '_toParamString', () => ({
//       text: 'dummy',
//       values: [1]
//     }));

//     const options = {test: 2};
//     assert.same(this.inst.toString(options), 'dummy');

//     spy.should.have.been.calledOnce;
//     return assert.same(spy.getCall(0).args[0], options);
//   }
// };

// test['QueryBuilder base class'] = {
//   beforeEach() {
//     this.cls = squel.cls.QueryBuilder;
//     return this.inst = new this.cls;
//   },

//   'instanceof base builder'() {
//     return assert.instanceOf(this.inst, squel.cls.BaseBuilder);
//   },

//   'constructor': {
//     'default options'() {
//       return assert.same(squel.cls.DefaultQueryBuilderOptions, this.inst.options);
//     },

//     'overridden options'() {
//       this.inst = new this.cls({
//         dummy1: 'str',
//         dummy2: 12.3,
//         usingValuePlaceholders: true,
//         dummy3: true
//       });

//       const expectedOptions = _.extend({}, squel.cls.DefaultQueryBuilderOptions, {
//         dummy1: 'str',
//         dummy2: 12.3,
//         usingValuePlaceholders: true,
//         dummy3: true
//       }
//       );

//       return assert.same(expectedOptions, this.inst.options);
//     },

//     'default blocks - none'() {
//       return assert.same([], this.inst.blocks);
//     },

//     'blocks passed in': {
//       'exposes block methods'() {
//         const limitExposedMethodsSpy = test.mocker.spy(squel.cls.LimitBlock.prototype, 'exposedMethods');
//         const distinctExposedMethodsSpy = test.mocker.spy(squel.cls.DistinctBlock.prototype, 'exposedMethods');
//         const limitSpy = test.mocker.spy(squel.cls.LimitBlock.prototype, 'limit');
//         const distinctSpy = test.mocker.spy(squel.cls.DistinctBlock.prototype, 'distinct');

//         const blocks = [
//           new squel.cls.LimitBlock(),
//           new squel.cls.DistinctBlock()
//         ];

//         this.inst = new this.cls({}, blocks);

//         assert.ok(limitExposedMethodsSpy.calledOnce);
//         assert.ok(distinctExposedMethodsSpy.calledOnce);

//         assert.typeOf(this.inst.distinct, 'function');
//         assert.typeOf(this.inst.limit, 'function');

//         assert.same(this.inst, this.inst.limit(2));
//         assert.ok(limitSpy.calledOnce);
//         assert.ok(limitSpy.calledOn(blocks[0]));

//         assert.same(this.inst, this.inst.distinct());
//         assert.ok(distinctSpy.calledOnce);
//         return assert.ok(distinctSpy.calledOn(blocks[1]));
//       },

//       'cannot expose the same method twice'() {
//         const blocks = [
//           new squel.cls.DistinctBlock(),
//           new squel.cls.DistinctBlock()
//         ];

//         try {
//           this.inst = new this.cls({}, blocks);
//           throw new Error('should not reach here');
//         } catch (err) {
//           return assert.same('Error: Builder already has a builder method called: distinct', err.toString());
//         }
//       }
//     }
//   },

//   'updateOptions()': {
//     'updates query builder options'() {
//       const oldOptions = _.extend({}, this.inst.options);

//       this.inst.updateOptions({
//         updated: false});

//       const expected = _.extend(oldOptions,
//         {updated: false});

//       return assert.same(expected, this.inst.options);
//     },

//     'updates building block options'() {
//       this.inst.blocks = [
//         new squel.cls.Block()
//       ];
//       const oldOptions = _.extend({}, this.inst.blocks[0].options);

//       this.inst.updateOptions({
//         updated: false});

//       const expected = _.extend(oldOptions,
//         {updated: false});

//       return assert.same(expected, this.inst.blocks[0].options);
//     }
//   },

//   'toString()': {
//     'returns empty if no blocks'() {
//       return assert.same('', this.inst.toString());
//     },

//     'skips empty block strings'() {
//       this.inst.blocks = [
//         new squel.cls.StringBlock({}, ''),
//       ];

//       return assert.same('', this.inst.toString());
//     },

//     'returns final query string'() {
//       let i = 1;
//       const toStringSpy = test.mocker.stub(squel.cls.StringBlock.prototype, '_toParamString', () => ({
//         text: `ret${++i}`,
//         values: []
//       }));

//       this.inst.blocks = [
//         new squel.cls.StringBlock({}, 'STR1'),
//         new squel.cls.StringBlock({}, 'STR2'),
//         new squel.cls.StringBlock({}, 'STR3')
//       ];

//       assert.same('ret2 ret3 ret4', this.inst.toString());

//       assert.ok(toStringSpy.calledThrice);
//       assert.ok(toStringSpy.calledOn(this.inst.blocks[0]));
//       assert.ok(toStringSpy.calledOn(this.inst.blocks[1]));
//       return assert.ok(toStringSpy.calledOn(this.inst.blocks[2]));
//     }
//   },

//   'toParam()': {
//     'returns empty if no blocks'() {
//       return assert.same({ text: '', values: [] }, this.inst.toParam());
//     },

//     'skips empty block strings'() {
//       this.inst.blocks = [
//         new squel.cls.StringBlock({}, ''),
//       ];

//       return assert.same({ text: '', values: [] }, this.inst.toParam());
//     },

//     'returns final query string'() {
//       this.inst.blocks = [
//         new squel.cls.StringBlock({}, 'STR1'),
//         new squel.cls.StringBlock({}, 'STR2'),
//         new squel.cls.StringBlock({}, 'STR3')
//       ];

//       let i = 1;
//       const toStringSpy = test.mocker.stub(squel.cls.StringBlock.prototype, '_toParamString', () => ({
//         text: `ret${++i}`,
//         values: []
//       }));

//       assert.same({ text: 'ret2 ret3 ret4', values: [] }, this.inst.toParam());

//       assert.ok(toStringSpy.calledThrice);
//       assert.ok(toStringSpy.calledOn(this.inst.blocks[0]));
//       assert.ok(toStringSpy.calledOn(this.inst.blocks[1]));
//       return assert.ok(toStringSpy.calledOn(this.inst.blocks[2]));
//     },

//     'returns query with unnumbered parameters'() {
//       this.inst.blocks = [
//         new squel.cls.WhereBlock({}),
//       ];

//       this.inst.blocks[0]._toParamString = test.mocker.spy(() => ({
//         text: 'a = ? AND b in (?, ?)',
//         values: [1, 2, 3]
//       }));

//       return assert.same({ text: 'a = ? AND b in (?, ?)', values: [1, 2, 3]}, this.inst.toParam());
//     },

//     'returns query with numbered parameters'() {
//       this.inst = new this.cls({
//         numberedParameters: true});

//       this.inst.blocks = [
//         new squel.cls.WhereBlock({}),
//       ];

//       test.mocker.stub(squel.cls.WhereBlock.prototype, '_toParamString', () => ({
//         text: 'a = ? AND b in (?, ?)',
//         values: [1, 2, 3]
//       }));

//       return assert.same(this.inst.toParam(), { text: 'a = $1 AND b in ($2, $3)', values: [1, 2, 3]});
//     },

//     'returns query with numbered parameters and custom prefix'() {
//       this.inst = new this.cls({
//         numberedParameters: true,
//         numberedParametersPrefix: '&%'
//       });

//       this.inst.blocks = [
//         new squel.cls.WhereBlock({}),
//       ];

//       test.mocker.stub(squel.cls.WhereBlock.prototype, '_toParamString', () => ({
//         text: 'a = ? AND b in (?, ?)',
//         values: [1, 2, 3]
//       }));

//       return assert.same(this.inst.toParam(), { text: 'a = &%1 AND b in (&%2, &%3)', values: [1, 2, 3]});
//     }
//   },

//   'cloning': {
//     'blocks get cloned properly'() {
//       const blockCloneSpy = test.mocker.spy(squel.cls.StringBlock.prototype, 'clone');

//       this.inst.blocks = [
//         new squel.cls.StringBlock({}, 'TEST')
//       ];

//       const newinst = this.inst.clone();
//       this.inst.blocks[0].str = 'TEST2';

//       return assert.same('TEST', newinst.blocks[0].toString());
//     }
//   },

//   'registerValueHandler': {
//     'beforEach'() {
//       return this.originalHandlers = [].concat(squel.cls.globalValueHandlers);
//     },
//     'afterEach'() {
//       return squel.cls.globalValueHandlers = this.originalHandlers;
//     },

//     'calls through to base class method'() {
//       const baseBuilderSpy = test.mocker.spy(squel.cls.BaseBuilder.prototype, 'registerValueHandler');

//       const handler = () => 'test';
//       this.inst.registerValueHandler(Date, handler);
//       this.inst.registerValueHandler('number', handler);

//       assert.ok(baseBuilderSpy.calledTwice);
//       return assert.ok(baseBuilderSpy.calledOn(this.inst));
//     },

//     'returns instance for chainability'() {
//       const handler = () => 'test';
//       return assert.same(this.inst, this.inst.registerValueHandler(Date, handler));
//     },

//     'calls through to blocks'() {
//       this.inst.blocks = [
//         new squel.cls.StringBlock({}, ''),
//       ];

//       const baseBuilderSpy = test.mocker.spy(this.inst.blocks[0], 'registerValueHandler');

//       const handler = () => 'test';
//       this.inst.registerValueHandler(Date, handler);

//       assert.ok(baseBuilderSpy.calledOnce);
//       return assert.ok(baseBuilderSpy.calledOn(this.inst.blocks[0]));
//     }
//   },

//   'get block': {
//     'valid'() {
//       const block = new squel.cls.FunctionBlock();
//       this.inst.blocks.push(block);
//       return assert.same(block, this.inst.getBlock(squel.cls.FunctionBlock));
//     },
//     'invalid'() {
//       return assert.same(undefined, this.inst.getBlock(squel.cls.FunctionBlock));
//     }
//   }
// };
