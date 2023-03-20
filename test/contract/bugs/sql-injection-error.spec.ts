import { insert } from '../../../lib/esm/index';

describe('A Sql Injection Error', () => {
    it('should escape single quotes on insert set fields', () => {
        // given

        // when
        const query = insert().into('buh').setFields({ foo: "bar'baz" }).toString();

        // then
        expect(query).toEqual("INSERT INTO buh (foo) VALUES ('bar''baz')");
    });
});
