import sinon from 'sinon';
import squel from '../src';
import { OnDuplicateKeyUpdateBlock } from '../src/block';
import { AbstractSetFieldBlock } from '../src/block/abstract-set-field-block';

let mocker;

let inst = squel.useFlavour('mysql').insert();

const areSame = function (actual, expected, message) {
    return expect(actual).toEqual(expected);
};

describe('MySQL flavour', () => {
    beforeEach(() => {
        mocker = sinon.sandbox.create();
    });

    afterEach(() => {
        mocker.restore();
    });

    it('Should extend squel base class', () => {
        const inst = squel.useFlavour('mysql').select().from('table').toString();

        expect(inst).toEqual('SELECT * FROM table');
    });

    describe('MysqlOnDuplicateKeyUpdateBlock', () => {
        beforeEach(() => {
            inst = new OnDuplicateKeyUpdateBlock();
        });

        it('instanceof of AbstractSetFieldBlock', () => {
            return expect(inst).toBeInstanceOf(AbstractSetFieldBlock);
        });

        describe('onDupUpdate()', () => {
            it('calls to _set()', () => {
                const spy = mocker.stub(inst, '_set');

                inst.onDupUpdate('f', 'v', { dummy: true });

                return expect(spy.calledWithExactly('f', 'v', { dummy: true })).toBeTruthy();
            });
        });

        describe('_toParamString()', () => {
            beforeEach(() => {
                inst.onDupUpdate('field1 = field1 + 1');
                inst.onDupUpdate('field2', 'value2', { dummy: true });

                return inst.onDupUpdate('field3', 'value3');
            });

            it('non-parameterized', () => {
                return areSame(inst._toParamString(), {
                    text: "ON DUPLICATE KEY UPDATE field1 = field1 + 1, field2 = 'value2', field3 = 'value3'",
                    values: [],
                });
            });
            it('parameterized()', () => {
                return areSame(inst._toParamString({ buildParameterized: true }), {
                    text: 'ON DUPLICATE KEY UPDATE field1 = field1 + 1, field2 = ?, field3 = ?',
                    values: ['value2', 'value3'],
                });
            });
        });
    });

    describe('INSERT builder', () => {
        beforeEach(() => {
            inst = squel.useFlavour('mysql').insert();
        });

        describe('>> into(table).set(field, 1).set(field1, 2).onDupUpdate(field, 5).onDupUpdate(field1, "str")', () => {
            beforeEach(() => {
                return inst
                    .into('table')
                    .set('field', 1)
                    .set('field1', 2)
                    .onDupUpdate('field', 5)
                    .onDupUpdate('field1', 'str');
            });
            it('toString', () => {
                return areSame(
                    inst.toString(),
                    "INSERT INTO table (field, field1) VALUES (1, 2) ON DUPLICATE KEY UPDATE field = 5, field1 = 'str'"
                );
            });

            it('toParam', () => {
                return areSame(inst.toParam(), {
                    text: 'INSERT INTO table (field, field1) VALUES (?, ?) ON DUPLICATE KEY UPDATE field = ?, field1 = ?',
                    values: [1, 2, 5, 'str'],
                });
            });
        });

        describe('>> into(table).set(field2, 3).onDupUpdate(field2, "str", { dontQuote: true })', () => {
            beforeEach(() => {
                return inst.into('table').set('field2', 3).onDupUpdate('field2', 'str', { dontQuote: true });
            });
            it('toString', () => {
                return areSame(
                    inst.toString(),
                    'INSERT INTO table (field2) VALUES (3) ON DUPLICATE KEY UPDATE field2 = str'
                );
            });
            it('toParam', () => {
                return areSame(inst.toParam(), {
                    text: 'INSERT INTO table (field2) VALUES (?) ON DUPLICATE KEY UPDATE field2 = ?',
                    values: [3, 'str'],
                });
            });
        });
    });

    describe('REPLACE builder', () => {
        beforeEach(() => {
            inst = squel.useFlavour('mysql').replace();
        });

        describe('>> into(table).set(field, 1).set(field1, 2)', () => {
            beforeEach(() => {
                return inst.into('table').set('field', 1).set('field1', 2);
            });
            it('toString', () => {
                return areSame(inst.toString(), 'REPLACE INTO table (field, field1) VALUES (1, 2)');
            });

            it('toParam', () => {
                return areSame(inst.toParam(), {
                    text: 'REPLACE INTO table (field, field1) VALUES (?, ?)',
                    values: [1, 2],
                });
            });
        });
    });
});
