import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'next', 'next/server'],
    esbuildOptions(options) {
      options.banner = { js: '"use client";' };
      options.jsx = 'automatic';
    },
  },
  {
    entry: { 'api/index': 'src/api/index.ts' },
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom', 'next', 'next/server', 'resend'],
  },
]);
