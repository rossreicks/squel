import typescript from 'rollup-plugin-typescript2';
import versionInjector from 'rollup-plugin-version-injector';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

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
            {
                entryFileNames: 'squel.min.js',
                dir: 'lib',
                format: 'iife',
                name: 'squel',
                plugins: [terser()],
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
