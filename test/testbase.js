var assert, chai, expect, should, sinon, testCreator;

sinon = require('sinon');

chai = require("chai");

assert = chai.assert;

expect = chai.expect;

should = chai.should();

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

module.exports = {
    _: require('underscore'),
    testCreator: testCreator,
    assert: assert,
    expect: expect,
    should: should
};
