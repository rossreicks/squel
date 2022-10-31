import typescript from 'rollup-plugin-typescript2';
import versionInjector from 'rollup-plugin-version-injector';
import dts from 'rollup-plugin-dts';

const configs = [
    {
        input: './src/index.ts',
        output: [
            {
                entryFileNames: 'squel.js',
                dir: 'lib',
                format: 'commonjs',
            },
            {
                entryFileNames: 'squel.esm.js',
                dir: 'lib',
                format: 'esm',
            },
        ],
        plugins: [versionInjector(), typescript({ useTsconfigDeclarationDir: true })],
    },
    {
        input: './type-definitions/src/index.d.ts',
        output: [{ entryFileNames: 'squel.d.ts', dir: 'lib', format: 'es' }],
        plugins: [dts()],
    },
];

export default configs;
