import typescript from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify'
import json from 'rollup-plugin-json'

export default [
  {
    input: 'src/index.ts',
    output: {
      name: 'Kurge',
      format: 'umd',
      file: 'dist/index.js'
    },
    plugins: [
      typescript({ useTsconfigDeclarationDir: true }),
      json()
    ]
  },
  {
    input: 'dist/index.js',
    output: {
      name: 'Kurge',
      format: 'umd',
      file: 'dist/kurge.min.js'
    },
    plugins: [
      uglify()
    ]
  }
]