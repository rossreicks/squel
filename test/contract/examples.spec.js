import { select } from '../../lib/esm/index';

describe('Select Tests', () => {
    it('should be able to select from a table', () => {
        // given

        // when
        const query = select().from('table').toString();

        // then
        expect(query).toBe('SELECT * FROM table');
    });
});
