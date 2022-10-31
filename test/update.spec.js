const sinon = require("sinon");
const squel = require("../src/core");

let func;
let inst;
let mocker;

describe("Update Tests", () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
        func = squel.insert;
        inst = func();
    });

    afterEach(() => {
        mocker.restore();
    });

    it("should be instance of query builder", () => {
        expect(inst).toBeInstanceOf(squel.cls.QueryBuilder);
    });
});
