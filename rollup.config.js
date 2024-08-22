import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import del from 'rollup-plugin-delete';

export default [
  {
    input: 'src/lib/index.ts',
    output: [{
      file: 'dist/petriflow.esm.js',
      format: 'esm',
      sourcemap: true
    }],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.esm.json'
      }),
      terser()
    ]
  },
  {
    input: 'src/lib/index.ts',
    output: {
      file: 'dist/petriflow.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.json',
      }),
      terser()
    ]
  },
  {
    input: 'dist/dts/index.d.ts',
    output: {
      file: 'dist/petriflow.d.ts',
      format: 'es'
    },
    plugins: [
      dts(),
      del({
        targets: 'dist/dts',
        hook: 'buildEnd'
      })
    ]
  }
]
