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

const squel = require("../dist/squel-basic");
const { _, testCreator, assert, expect, should } = require("./testbase");
const test = testCreator();

test["Case expression builder base class"] = {
    beforeEach() {
        this.func = squel.case;
        this.inst = this.func();
        // manual return,
        // otherwise @inst will be treated a promise because it has a then() method
    },

    "extends BaseBuilder"() {
        return assert.ok(this.inst instanceof squel.cls.BaseBuilder);
    },

    "toString() returns NULL"() {
        return assert.same("NULL", this.inst.toString());
    },

    options: {
        "default options"() {
            return assert.same(
                squel.cls.DefaultQueryBuilderOptions,
                this.inst.options
            );
        },
        "custom options"() {
            const e = this.func({
                separator: ",asdf",
            });

            const expected = _.extend(
                {},
                squel.cls.DefaultQueryBuilderOptions,
                {
                    separator: ",asdf",
                }
            );

            return assert.same(expected, e.options);
        },
    },

      'build expression': {
        '>> when().then()': {
          beforeEach() {
            this.inst.when('?', 'foo').then('bar');
            // manual return,
            // otherwise @inst will be treated a promise because it has a then() method
          },

          toString() {
            return assert.same(this.inst.toString(), 'CASE WHEN (\'foo\') THEN \'bar\' ELSE NULL END');
          },
          toParam() {
            return assert.same(this.inst.toParam(), {
              text: 'CASE WHEN (?) THEN \'bar\' ELSE NULL END',
              values: ['foo']
            });
          }
        },

        '>> when().then().else()': {
          beforeEach() {
              this.inst.when('?', 'foo').then('bar').else('foobar');
              // manual return,
              // otherwise @inst will be treated a promise because it has a then() method
            },
          toString() {
            return assert.same(this.inst.toString(), 'CASE WHEN (\'foo\') THEN \'bar\' ELSE \'foobar\' END');
          },
          toParam() {
            return assert.same(this.inst.toParam(), {
              text: 'CASE WHEN (?) THEN \'bar\' ELSE \'foobar\' END',
              values: ['foo']
            });
          }
        }
      },

      'field case': {
        beforeEach() {
          this.inst = this.func('name').when('?', 'foo').then('bar');
          // manual return,
          // otherwise @inst will be treated a promise because it has a then() method
        },
        toString() {
          return assert.same(this.inst.toString(), 'CASE name WHEN (\'foo\') THEN \'bar\' ELSE NULL END');
        },
        toParam() {
          return assert.same(this.inst.toParam(), {
            text: 'CASE name WHEN (?) THEN \'bar\' ELSE NULL END',
            values: ['foo']
          });
        }
      }
};
