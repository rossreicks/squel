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

    var assert, expect, should, squel, test, testCreator, _, _ref;

    squel = require("../src/core");

    _ref = require('./testbase'), _ = _ref._, testCreator = _ref.testCreator, assert = _ref.assert, expect = _ref.expect, should = _ref.should;

    test = testCreator();

    describe('INSERT builder', () => {
      beforeEach(function() {
        this.func = squel.insert;
        return this.inst = this.func();
      });

      it('instanceof QueryBuilder', function() {
        return assert.instanceOf(this.inst, squel.cls.QueryBuilder);
      });
      describe('constructor', () => {
        it('override options', function() {
          var block, expectedOptions, _i, _len, _ref1, _results;
          this.inst = squel.update({
            usingValuePlaceholders: true,
            dummy: true
          });
          expectedOptions = _.extend({}, squel.cls.DefaultQueryBuilderOptions, {
            usingValuePlaceholders: true,
            dummy: true
          });
          _ref1 = this.inst.blocks;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            block = _ref1[_i];
            _results.push(assert.same(_.pick(block.options, _.keys(expectedOptions)), expectedOptions));
          }
        });
        it('override blocks', function() {
          var block;
          block = new squel.cls.StringBlock('SELECT');
          this.inst = this.func({}, [block]);
          return assert.same([block], this.inst.blocks);
        });
      });

      describe('build query', () => {
        it('need to call into() first', function() {
          return assert.throws(((function(_this) {
            return function() {
              return _this.inst.toString();
            };
          })(this)), 'into() needs to be called');
        });
        it('when set() not called', function() {
          return assert.same('INSERT INTO table', this.inst.into('table').toString());
        });

        describe('>> into(table).set(field, null)', () => {
          beforeEach(function() {
            return this.inst.into('table').set('field', null);
          });
          it('toString', function() {
            return assert.same(this.inst.toString(), 'INSERT INTO table (field) VALUES (NULL)');
          });
          it('toParam', function() {
            return assert.same(this.inst.toParam(), {
              text: 'INSERT INTO table (field) VALUES (?)',
              values: [null]
            });
          });
        });
        describe('>> into(table)', () => {
          beforeEach(function() {
            return this.inst.into('table');
          });
          describe('>> set(field, 1)', () => {
            beforeEach(function() {
              return this.inst.set('field', 1);
            });
            it('toString', function() {
              return assert.same(this.inst.toString(), 'INSERT INTO table (field) VALUES (1)');
            });
            describe('>> set(field2, 1.2)', () => {
              beforeEach(function() {
                return this.inst.set('field2', 1.2);
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, 1.2)');
              });
            });
            describe('>> set(field2, "str")', () => {
              beforeEach(function() {
                return this.inst.set('field2', 'str');
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, \'str\')');
              });
              it('toParam', function() {
                return assert.same(this.inst.toParam(), {
                  text: 'INSERT INTO table (field, field2) VALUES (?, ?)',
                  values: [1, 'str']
                });
              });
            });
            describe('>> set(field2, "str", { dontQuote: true } )', () => {
              beforeEach(function() {
                return this.inst.set('field2', 'str', {
                  dontQuote: true
                });
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, str)');
              });
              it('toParam', function() {
                return assert.same(this.inst.toParam(), {
                  text: 'INSERT INTO table (field, field2) VALUES (?, ?)',
                  values: [1, 'str']
                });
              });
            });
            describe('>> set(field2, true)', () => {
              beforeEach(function() {
                return this.inst.set('field2', true);
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, TRUE)');
              });
            });
            describe('>> set(field2, null)', () => {
              beforeEach(function() {
                return this.inst.set('field2', null);
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, NULL)');
            });
            });
            describe('>> set(field, query builder)', () => {
              beforeEach(function() {
                this.subQuery = squel.select().field('MAX(score)').from('scores');
                return this.inst.set('field', this.subQuery);
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field) VALUES ((SELECT MAX(score) FROM scores))');
                });
              it('toParam', function() {
                var parameterized;
                parameterized = this.inst.toParam();
                assert.same(parameterized.text, 'INSERT INTO table (field) VALUES ((SELECT MAX(score) FROM scores))');
                return assert.same(parameterized.values, []);
            });
            });
            describe('>> setFields({field2: \'value2\', field3: true })', () => {
              beforeEach(function() {
                return this.inst.setFields({
                  field2: 'value2',
                  field3: true
                });
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2, field3) VALUES (1, \'value2\', TRUE)');
            });
              it('toParam', function() {
                var parameterized;
                parameterized = this.inst.toParam();
                assert.same(parameterized.text, 'INSERT INTO table (field, field2, field3) VALUES (?, ?, ?)');
                return assert.same(parameterized.values, [1, 'value2', true]);
            });
            });
            describe('>> setFields({field2: \'value2\', field: true })', () => {
              beforeEach(function() {
                return this.inst.setFields({
                  field2: 'value2',
                  field: true
                });
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2) VALUES (TRUE, \'value2\')');
            });
              it('toParam', function() {
                var parameterized;
                parameterized = this.inst.toParam();
                assert.same(parameterized.text, 'INSERT INTO table (field, field2) VALUES (?, ?)');
                return assert.same(parameterized.values, [true, 'value2']);
            });
            });
            describe('>> setFields(custom value type)', () => {
              beforeEach(function() {
                var MyClass;
                MyClass = (function() {
                  function MyClass() {}

                  return MyClass;

                })();
                this.inst.registerValueHandler(MyClass, function() {
                  return 'abcd';
                });
                return this.inst.setFields({
                  field: new MyClass()
                });
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field) VALUES ((abcd))');
            });
              it('toParam', function() {
                var parameterized;
                parameterized = this.inst.toParam();
                assert.same(parameterized.text, 'INSERT INTO table (field) VALUES (?)');
                return assert.same(parameterized.values, ['abcd']);
              });
            });
            describe('>> setFieldsRows([{field: \'value2\', field2: true },{field: \'value3\', field2: 13 }]])', () => {
              beforeEach(function() {
                return this.inst.setFieldsRows([
                  {
                    field: 'value2',
                    field2: true
                  }, {
                    field: 'value3',
                    field2: 13
                  }
                ]);
              });
              it('toString', function() {
                return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2) VALUES (\'value2\', TRUE), (\'value3\', 13)');
            });
              it('toParam', function() {
                var parameterized;
                parameterized = this.inst.toParam();
                assert.same(parameterized.text, 'INSERT INTO table (field, field2) VALUES (?, ?), (?, ?)');
                return assert.same(parameterized.values, ['value2', true, 'value3', 13]);
            });
            });
        });
        describe('Function values', () => {
            beforeEach(function() {
              return this.inst.set('field', squel.str('GETDATE(?, ?)', 2014, 'feb'));
            });
            it('toString', function() {
              return assert.same('INSERT INTO table (field) VALUES ((GETDATE(2014, \'feb\')))', this.inst.toString());
            });
            it('toParam', function() {
              return assert.same({
                text: 'INSERT INTO table (field) VALUES ((GETDATE(?, ?)))',
                values: [2014, 'feb']
              }, this.inst.toParam());
            });
          });
          describe('>> fromQuery([field1, field2], select query)', () => {
            beforeEach(function() {
              return this.inst.fromQuery(['field1', 'field2'], squel.select().from('students').where('a = ?', 2));
            });
            it('toString', function() {
              return assert.same(this.inst.toString(), 'INSERT INTO table (field1, field2) (SELECT * FROM students WHERE (a = 2))');
            });
            it('toParam', function() {
              var parameterized;
              parameterized = this.inst.toParam();
              assert.same(parameterized.text, 'INSERT INTO table (field1, field2) (SELECT * FROM students WHERE (a = ?))');
              return assert.same(parameterized.values, [2]);
            });
          });
          it('>> setFieldsRows([{field1: 13, field2: \'value2\'},{field1: true, field3: \'value4\'}])', function() {
            return assert.throws(((function(_this) {
              return function() {
                return _this.inst.setFieldsRows([
                  {
                    field1: 13,
                    field2: 'value2'
                  }, {
                    field1: true,
                    field3: 'value4'
                  }
                ]).toString();
              };
            })(this)), 'All fields in subsequent rows must match the fields in the first row');
          });
        });
      });
      describe('dontQuote and replaceSingleQuotes set(field2, "ISNULL(\'str\', str)", { dontQuote: true })', () => {
        beforeEach(function() {
          this.inst = squel.insert({
            replaceSingleQuotes: true
          });
          this.inst.into('table').set('field', 1);
          return this.inst.set('field2', "ISNULL('str', str)", {
            dontQuote: true
          });
        });
        it('toString', function() {
          return assert.same(this.inst.toString(), 'INSERT INTO table (field, field2) VALUES (1, ISNULL(\'str\', str))');
        });
        it('toParam', function() {
          return assert.same(this.inst.toParam(), {
            text: 'INSERT INTO table (field, field2) VALUES (?, ?)',
            values: [1, "ISNULL('str', str)"]
          });
        });
      });
      it('fix for #225 - autoquoting field names', function() {
        this.inst = squel.insert({
          autoQuoteFieldNames: true
        }).into('users').set('active', 1).set('regular', 0).set('moderator', 1);
        return assert.same(this.inst.toParam(), {
          text: 'INSERT INTO users (`active`, `regular`, `moderator`) VALUES (?, ?, ?)',
          values: [1, 0, 1]
        });
      });
      it('cloning', function() {
        var newinst;
        newinst = this.inst.into('students').set('field', 1).clone();
        newinst.set('field', 2).set('field2', true);
        assert.same('INSERT INTO students (field) VALUES (1)', this.inst.toString());
        return assert.same('INSERT INTO students (field, field2) VALUES (2, TRUE)', newinst.toString());
      });
    });

