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

(function() {
    var assert, chai, expect, should, sinon, testCreator;

    sinon = require('sinon');

    chai = require("chai");

    assert = chai.assert;

    expect = chai.expect;

    should = chai.should();


    /*
    Assert that two items are the same.

    @param actual
    @param expected
    @param {String} [message] failure message
     */

    assert.same = function(actual, expected, message) {
      return assert.deepEqual(actual, expected, message);
    };

    testCreator = function() {
      var test;
      test = {
        mocker: null,
        beforeEach: function() {
          return test.mocker = sinon.sandbox.create();
        },
        afterEach: function() {
          return test.mocker.restore();
        }
      };
      return test;
    };

    if (typeof module !== "undefined" && module !== null) {
      module.exports = {
        _: require('underscore'),
        testCreator: testCreator,
        assert: assert,
        expect: expect,
        should: should
      };
    }

  }).call(this);
