import {defineConfig} from 'vitest/config'
import CssHmr from '../build/rollup-plugin-css-hmr.js'

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
			...CssHmr('.ts'),
			enforce: 'post',
		}
	],
	test: {
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
	}
})