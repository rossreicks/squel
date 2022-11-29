import squel from '../../lib/esm/index';

describe('Version', () => {
    it('should have version number set', async () => {
        // given
        const version = squel.VERSION;

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        expect(version).toBe(require('../../package.json').version);
    });
});
