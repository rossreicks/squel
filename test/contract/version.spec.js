// import default

import { VERSION } from '../../lib/esm/index';

describe('Version', () => {
    it('should have version number set', async () => {
        // given
        const version = VERSION;

        expect(version).toBe(require('../../package.json').version);
    });
});
