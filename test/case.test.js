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

import { extend } from 'lodash';
import squel from '../lib/cjs';
import { BaseBuilder, DefaultQueryBuilderOptions } from '../lib/cjs/base-builder';

const areEqual = function (actual, expected, message) {
    expect(actual).toEqual(expected);
};

let inst = squel.case();

describe('Case expression builder base class', () => {
    beforeEach(() => {
        inst = squel.case();
    });

    it('extends BaseBuilder', () => {
        expect(inst instanceof BaseBuilder).toBeTruthy();
    });

    it('toString() returns NULL', () => {
        areEqual('NULL', inst.toString());
    });

    describe('options', () => {
        it('default options', () => {
            areEqual(DefaultQueryBuilderOptions, inst.options);
        });
        it('custom options', () => {
            const e = squel.case({
                separator: ',asdf',
            });

            const expected = extend({}, DefaultQueryBuilderOptions, {
                separator: ',asdf',
            });

            areEqual(expected, e.options);
        });
    });

    describe('build expression', () => {
        describe('>> when().then()', () => {
            beforeEach(() => {
                inst.when('?', 'foo').then('bar');
            });

            it('toString', () => {
                areEqual(inst.toString(), "CASE WHEN ('foo') THEN 'bar' ELSE NULL END");
            });
            it('toParam', () => {
                areEqual(inst.toParam(), {
                    text: "CASE WHEN (?) THEN 'bar' ELSE NULL END",
                    values: ['foo'],
                });
            });
        });

        describe('>> when().then().else()', () => {
            beforeEach(() => {
                inst.when('?', 'foo').then('bar').else('foobar');
            });
            it('toString', () => {
                areEqual(inst.toString(), "CASE WHEN ('foo') THEN 'bar' ELSE 'foobar' END");
            });
            it('toParam', () => {
                areEqual(inst.toParam(), {
                    text: "CASE WHEN (?) THEN 'bar' ELSE 'foobar' END",
                    values: ['foo'],
                });
            });
        });
    });

    describe('field case', () => {
        beforeEach(() => {
            inst = squel.case('name').when('?', 'foo').then('bar');
        });
        it('toString', () => {
            areEqual(inst.toString(), "CASE name WHEN ('foo') THEN 'bar' ELSE NULL END");
        });
        it('toParam', () => {
            areEqual(inst.toParam(), {
                text: "CASE name WHEN (?) THEN 'bar' ELSE NULL END",
                values: ['foo'],
            });
        });
    });
});
