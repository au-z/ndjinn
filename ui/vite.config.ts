import { defineConfig } from 'vitest/config'
import CssHmr from 'rollup-plugin-css-hmr'

export default defineConfig({
  server: {
    proxy: {
      '/api/v1/employee': {
        target: 'http://dummy.restapiexample.com',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    {
      ...CssHmr({
        'src/**/*': { ext: '.ts', page: true },
      }),
      enforce: 'post',
    },
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
})
